import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
    let supabaseResponse = NextResponse.next({
      request,
    })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Get the user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()

    // If there's an error getting the user, redirect to login
    if (error) {
      console.error('Middleware, error getting user:', error)
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
    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
} 