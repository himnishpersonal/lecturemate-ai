'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Try to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Handle specific error cases
    if (signInError) {
      if (signInError.message === 'Email not confirmed') {
        throw new Error('Please verify your email before logging in. You can request a new confirmation email using the button below.')
      }
      if (signInError.message === 'Invalid login credentials') {
        throw new Error('Incorrect email or password. Please try again.')
      }
      if (signInError.message.includes('rate limit')) {
        throw new Error('Too many login attempts. Please try again in a few minutes.')
      }
      
      console.error('Login error:', signInError)
      throw signInError
    }

    // Verify the session was created
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user after login:', userError)
      throw new Error('Failed to create session. Please try again.')
    }

    // Successfully logged in
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function resendConfirmation(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    throw new Error('Email is required')
  }

  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    
    if (resendError) {
      if (resendError.message.includes('rate limit')) {
        // Extract the time from the error message if possible
        const timeMatch = resendError.message.match(/(\d+) seconds/)
        const waitTime = timeMatch ? timeMatch[1] : '30'
        throw new Error(`Please wait ${waitTime} seconds before requesting another confirmation email. Check your inbox for the previous email.`)
      }
      console.error('Error resending confirmation:', resendError)
      throw new Error('Failed to resend confirmation email. Please try again later.')
    }
    
    return { message: 'Confirmation email sent. Please check your inbox.' }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred. Please try again later.')
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      throw error
    }

    // Successfully signed up
    revalidatePath('/', 'layout')
    redirect('/login?message=check-email')
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

export async function logout() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      throw error
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}