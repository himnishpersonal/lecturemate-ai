'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFormState } from 'react-dom'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login, signup, resendConfirmation } from './actions'
import { Brain } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')

  // Use the auth hook to monitor auth state changes
  useAuth()

  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    if (message === 'check-email') {
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation email. Please check your inbox.',
      })
    }

    if (error === 'email-not-verified') {
      toast({
        variant: 'destructive',
        title: 'Email not verified',
        description: 'Please verify your email before logging in. You can request a new confirmation email using the button below.',
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (formData: FormData) => {
    try {
      if (isSignUp) {
        await signup(formData)
      } else {
        await login(formData)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
      }
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your email address first',
      })
      return
    }

    setIsResending(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      const result = await resendConfirmation(formData)
      toast({
        title: 'Success',
        description: result.message,
      })
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
      <div className="relative w-full max-w-md mx-4">
        <div className="absolute inset-0 bg-blue-500 transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <Card className="relative shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to LectureMate</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <form action={isSignUp ? signup : login}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
              >
                {isSignUp ? 'Sign up' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
              {!isSignUp && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend confirmation email'}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}