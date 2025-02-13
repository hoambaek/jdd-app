import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, value } = body;
    
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    );

    // 요청하는 사용자가 관리자인지 확인
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminUser.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 이메일 또는 비밀번호 업데이트
    if (action === 'updateEmail') {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { email: value }
      );
      if (error) throw error;
    } else if (action === 'updatePassword') {
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: value }
      );
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in user update:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 