import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

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
    const regularClient = createRouteHandlerClient<Database>(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );

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

    // 4. 서비스 역할 클라이언트 생성
    const serviceRoleClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // 5. 사용자 업데이트 작업 수행
    let updateResult;
    if (action === 'updateEmail') {
      updateResult = await serviceRoleClient.auth.admin.updateUserById(
        userId,
        { email: value }
      );
    } else if (action === 'updatePassword') {
      updateResult = await serviceRoleClient.auth.admin.updateUserById(
        userId,
        { password: value }
      );
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 작업' },
        { status: 400 }
      );
    }

    if (updateResult.error) {
      throw updateResult.error;
    }

    return NextResponse.json({ 
      success: true,
      message: '성공적으로 업데이트되었습니다' 
    });

  } catch (error: any) {
    console.error('관리자 업데이트 오류:', error);
    return NextResponse.json(
      { 
        error: error.message || '서버 오류 발생',
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
} 