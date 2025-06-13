import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  console.log('Confirmation request received:', {
    token_hash: token_hash ? 'present' : 'missing',
    type,
    url: requestUrl.toString()
  })

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    try {
      // Verify the OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })

      if (verifyError) {
        console.error('Error verifying OTP:', verifyError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=invalid-verification`
        )
      }

      // Get the user to verify they're authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Error getting user:', userError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=session-error`
        )
      }

      console.log('Email confirmed and user verified:', {
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      })

      // Redirect to home page
      return NextResponse.redirect(`${requestUrl.origin}/`)
    } catch (error) {
      console.error('Error in confirmation process:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=verification-failed`
      )
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=invalid-verification`
  )
}