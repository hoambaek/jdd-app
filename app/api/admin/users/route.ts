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
      // 1. 사용자 정보 가져오기
      const { data: userData, error: userError } = await adminClient
        .auth.admin.getUserById(userId);

      if (userError) throw userError;

      // 2. 직접 Auth API 호출하여 비밀번호 변경
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
        },
        body: JSON.stringify({
          password: value,
          email_confirm: true
        })
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('비밀번호 변경 오류 응답:', responseText);
        throw new Error(`비밀번호 변경 실패: ${response.status} ${response.statusText}`);
      }

      console.log('비밀번호 변경 성공:', userId);
      
      // 3. 프로필 테이블 업데이트
      try {
        await adminClient
          .from('profiles')
          .update({ 
            updated_at: new Date().toISOString(),
            last_password_update: new Date().toISOString()
          })
          .eq('id', userId);
      } catch (profileError) {
        console.log('프로필 업데이트 오류:', profileError);
        // 프로필 업데이트 실패는 무시
      }
      
      updateResult = { data: { user: userData.user }, error: null };
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