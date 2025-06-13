'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (action: typeof login | typeof signup) => {
    setIsLoading(true)
    try {
      const formData = new FormData(document.querySelector('form')!)
      await action(formData)
    } catch (error) {
      console.error('Authentication error:', error)
      toast({
        variant: 'destructive',
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
      })
    } finally {
      setIsLoading(false)
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
          <form>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="bg-white text-black placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="bg-white text-black placeholder:text-gray-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
                onClick={() => handleSubmit(login)}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
                onClick={() => handleSubmit(signup)}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}