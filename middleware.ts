import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log('Middleware session:', session?.user?.id);

    // 세션 갱신
    if (session) {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      console.log('Session refreshed:', refreshedSession?.user?.id);
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 