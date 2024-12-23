import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 세션 새로고침 시도
  await supabase.auth.getSession()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 보호된 경로 목록
  const protectedRoutes = ['/my', '/badges', '/activity', '/story']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/my/:path*', '/badges/:path*', '/activity/:path*', '/story/:path*', '/login', '/signup']
} 