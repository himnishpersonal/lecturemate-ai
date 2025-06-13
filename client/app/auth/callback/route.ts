import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // After successful confirmation, try to get the session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return NextResponse.redirect(new URL('/login', request.url))
      }

      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Successfully confirmed and logged in
      return NextResponse.redirect(new URL('/', request.url))
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
} 