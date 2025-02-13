import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(request: Request) {
  const supabaseAdmin = createRouteHandlerClient({ 
    cookies,
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  });

  const { userId, action, value, adminSession } = await request.json();

  // 관리자 인증 확인
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(adminSession);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 관리자 권한 확인
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 비밀번호 변경 로직
  if (action === 'updatePassword') {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: value }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
} 