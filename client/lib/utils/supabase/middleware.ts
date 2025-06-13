import { type NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function updateSession(request: NextRequest) {
  try {
    // Check if we're on the login page
    const isLoginPage = request.nextUrl.pathname === '/login'
    const isAuthCallback = request.nextUrl.pathname === '/auth/callback'

    // Don't redirect if we're on the auth callback page
    if (isAuthCallback) {
      return NextResponse.next()
    }

    // Get the session from Supabase
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()

    // If there's an error getting the session, redirect to login
    if (error) {
      console.error('Error getting session:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If there's no session and we're not on the login page, redirect to login
    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // If we have a session and we're on the login page, redirect to home
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 