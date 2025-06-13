import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(new URL('/login?error=session-exchange-failed', request.url))
      }
      
      // After successful confirmation, try to get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return NextResponse.redirect(new URL('/login?error=session-error', request.url))
      }

      if (!session) {
        return NextResponse.redirect(new URL('/login?error=no-session', request.url))
      }

      // Successfully confirmed and logged in
      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/login?error=callback-error', request.url))
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/login?error=no-code', request.url))
} 