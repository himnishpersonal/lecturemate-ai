import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function updateSession(request: NextRequest) {
  try {
    // Check if we're on auth-related pages
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isAuthCallback = request.nextUrl.pathname === '/auth/callback'
    const isAuthConfirm = request.nextUrl.pathname === '/auth/confirm'

    // Don't redirect if we're on auth-related pages
    if (isAuthCallback || isAuthConfirm) {
      return NextResponse.next()
    }

    // Create middleware client
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Get the user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()

    // If there's an error getting the user, redirect to login
    if (error) {
      console.error('Error getting user:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If there's no user and we're not on the login page, redirect to login
    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If we have a user and we're on the login page, redirect to home
    if (user && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Continue with the request
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 