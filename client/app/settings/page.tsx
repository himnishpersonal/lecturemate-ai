'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppSidebar } from '@/components/app-sidebar'
import { FolderOpen } from 'lucide-react'

export default function SettingsPage() {
  const [selectedPath, setSelectedPath] = useState<string>('')
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Fetch the current user's path when component mounts
  useEffect(() => {
    const fetchUserPath = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user data",
        })
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('path')
        .eq('id', user.id)
        .single()

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user settings",
        })
        return
      }

      if (data?.path) {
        setSelectedPath(data.path)
      }
    }

    fetchUserPath()
  }, [supabase, toast])

  const handleDirectorySelect = async () => {
    try {
      // Request permission to access file system
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      })

      // Get the directory path
      const path = dirHandle.name // This will get the directory name

      // Store the directory handle for future access
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not found')
      }

      // Update the path in Supabase
      const { error } = await supabase
        .from('users')
        .update({ path: path })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      setSelectedPath(path)

      // Show success message
      toast({
        title: "Success",
        description: "Storage location updated successfully",
      })

      // Store the directory handle permission
      try {
        const verificationState = await dirHandle.requestPermission({ mode: 'readwrite' })
        if (verificationState !== 'granted') {
          throw new Error('Permission not granted')
        }
      } catch (permError) {
        toast({
          variant: "destructive",
          title: "Permission Error",
          description: "Failed to get persistent permission for the directory",
        })
      }

    } catch (error) {
      console.error('Error selecting directory:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set storage location",
      })
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        onUploadClick={() => {}}
        onDashboardClick={() => window.location.href = '/'}
        onFoldersClick={() => window.location.href = '/'}
        onSearchClick={() => window.location.href = '/'}
        onNotesClick={() => window.location.href = '/'}
        currentView="overview"
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure your application preferences
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Storage Location
              </CardTitle>
              <CardDescription>
                Choose where to store your lectures and notes on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPath || 'No location selected'}
                  </p>
                </div>
                <Button
                  onClick={handleDirectorySelect}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Select Directory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 