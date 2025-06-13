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

  const supabase = createRouteHandlerClient({ cookies })

  // Try to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If we get an email not confirmed error, resend the confirmation email
  if (error?.message === 'Email not confirmed') {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    
    if (resendError) {
      console.error('Error resending confirmation:', resendError)
      throw new Error('Failed to resend confirmation email. Please try again.')
    }
    
    throw new Error('Please check your email to confirm your account. A new confirmation email has been sent.')
  }

  if (error) {
    console.error('Login error:', error)
    throw error
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const supabase = createRouteHandlerClient({ cookies })
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  revalidatePath('/', 'layout')
  redirect('/')
}