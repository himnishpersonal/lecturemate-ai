'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/utils/supabase/server-component'

export async function updateStoragePath(path: string, isVerified: boolean) {
  if (!isVerified) {
    throw new Error('Directory permissions not verified. Please ensure read and write access is granted.')
  }

  const supabase = await createClient()

  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in to set a storage location')
    }

    // Get the profile for the authenticated user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, path')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      throw new Error('Could not find user profile')
    }

    // If path is being changed, include that in the response
    const isPathChange = profile.path && profile.path !== path

    // Update the path in the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ path: path })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/settings')
    return { 
      message: isPathChange 
        ? 'Storage location changed successfully' 
        : 'Storage location set successfully',
      isPathChange
    }
  } catch (error) {
    console.error('Error updating storage path:', error)
    throw error
  }
}

export async function getStoragePath() {
  const supabase = await createClient()

  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Please log in to view settings')
    }

    // Get the profile and path
    const { data, error } = await supabase
      .from('profiles')
      .select('path')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return data?.path || null
  } catch (error) {
    console.error('Error fetching storage path:', error)
    throw error
  }
} 