import { type NextRequest } from 'next/server'
import { updateSession } from './lib/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - auth (auth routes for email confirmation)
     * - login (allow access to login page)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|auth|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}