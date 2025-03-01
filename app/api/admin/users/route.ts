import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

// 서비스 롤 클라이언트 생성
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, value } = body;

    // 1. 환경 변수 유효성 검사
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
        !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }

    // 2. 일반 클라이언트 초기화 (관리자 체크용)
    const regularClient = createRouteHandlerClient<Database>({ cookies });

    // 3. 관리자 권한 확인
    const { data: { user }, error: authError } = await regularClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증 필요' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await regularClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: '권한 없음' },
        { status: 403 }
      );
    }

    // 4. 사용자 업데이트 작업 수행
    let updateResult;
    
    if (action === 'updateEmail') {
      updateResult = await adminClient.auth.admin.updateUserById(
        userId,
        { email: value }
      );
    } else if (action === 'updatePassword') {
      // 비밀번호 변경 방식 1: 관리자 API 사용
      const { data: userData, error: userError } = await adminClient
        .auth.admin.getUserById(userId);

      if (userError) {
        throw userError;
      }

      // 방법 1: 관리자 API로 직접 업데이트
      updateResult = await adminClient.auth.admin.updateUserById(
        userId,
        { 
          password: value
        }
      );

      // 업데이트가 실패하면 다른 방법 시도
      if (updateResult.error) {
        console.log("직접 비밀번호 변경 실패, 비밀번호 재설정 방식으로 시도합니다.");
        
        // 방법 2: 비밀번호 재설정 토큰을 생성하고 직접 적용
        const { data: resetData, error: resetError } = await adminClient
          .auth.admin.generateLink({
            type: 'recovery',
            email: userData.user.email,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
            }
          });
          
        if (resetError) {
          throw resetError;
        }
        
        // 참고: 이 메서드는 문서화되지 않은 방식으로, Supabase가 내부적으로 사용하는 방식입니다
        // 실제 구현은 Supabase의 내부 API를 사용하므로 향후 변경될 수 있습니다
        if (resetData && resetData.properties && resetData.properties.hashed_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
            },
            body: JSON.stringify({
              token: resetData.properties.token,
              type: 'recovery',
              password: value
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`비밀번호 재설정 실패: ${errorData.message || response.statusText}`);
          }
          
          updateResult = { data: { user: userData.user }, error: null };
        } else {
          throw new Error('비밀번호 재설정 토큰을 생성할 수 없습니다.');
        }
      }

      // 사용자 세션 무효화
      if (!updateResult.error) {
        try {
          // 다른 방식으로 세션 무효화 시도
          const { error: revokeError } = await adminClient.auth.admin.revokeSessionsForUser(userId);
          
          if (revokeError) {
            console.log('세션 무효화 오류:', revokeError);
            // 오류가 있어도 계속 진행
          }
          
          // 프로필 테이블 업데이트 (있다면)
          try {
            await adminClient
              .from('profiles')
              .update({ 
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
          } catch (profileError) {
            console.log('프로필 업데이트 오류:', profileError);
            // 프로필 업데이트 실패는 무시
          }
        } catch (error) {
          console.log('로그아웃/세션 관리 오류:', error);
          // 오류가 있어도 계속 진행
        }
      }
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 작업' },
        { status: 400 }
      );
    }

    if (updateResult?.error) {
      console.error('업데이트 오류:', updateResult.error);
      throw updateResult.error;
    }

    return NextResponse.json({ 
      success: true,
      message: action === 'updatePassword' ? 
        '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.' : 
        '이메일이 성공적으로 변경되었습니다.',
      data: {
        userId,
        action,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('관리자 업데이트 오류:', error);
    return NextResponse.json(
      { 
        error: error.message || '서버 오류 발생',
        details: error instanceof Error ? error.stack : null,
        errorCode: error.code || 'UNKNOWN_ERROR'
      },
      { status: error.status || 500 }
    );
  }
} 