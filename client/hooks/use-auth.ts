import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/client-component'

export function useAuth() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if the user's email is verified
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          return
        }

        if (user && !user.email_confirmed_at) {
          // Email not verified, redirect to login with message
          router.push('/login?error=email-not-verified')
        } else {
          // Email verified, refresh the page to update the session
          router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])
} 