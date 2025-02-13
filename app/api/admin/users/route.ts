import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // 서비스 역할 키를 사용한 관리자 클라이언트 생성
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { userId, action, value } = await request.json();

  try {
    switch (action) {
      case 'updatePassword':
        const { data, error } = await adminSupabase.auth.admin.updateUserById(
          userId,
          { password: value }
        );
        if (error) throw error;
        return NextResponse.json(data);
        
      case 'updateEmail':
        const { data: emailData, error: emailError } = await adminSupabase.auth.admin.updateUserById(
          userId,
          { email: value }
        );
        if (emailError) throw emailError;
        return NextResponse.json(emailData);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 