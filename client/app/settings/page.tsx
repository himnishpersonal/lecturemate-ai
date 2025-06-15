'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppSidebar } from '@/components/app-sidebar'
import { FolderOpen, AlertCircle } from 'lucide-react'
import { updateStoragePath, getStoragePath } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingDirHandle, setPendingDirHandle] = useState<any>(null)
  const { toast } = useToast()

  // Fetch the current user's path when component mounts
  useEffect(() => {
    const fetchPath = async () => {
      try {
        const path = await getStoragePath()
        if (path) {
          setSelectedPath(path)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch settings',
        })
      }
    }

    fetchPath()
  }, [toast])

  const verifyDirectoryPermissions = async (dirHandle: any) => {
    try {
      // Request read/write permissions
      const verificationState = await dirHandle.requestPermission({ mode: 'readwrite' })
      if (verificationState !== 'granted') {
        throw new Error('Full directory access is required')
      }

      // Try to create a test file to verify write permissions
      try {
        const testFileHandle = await dirHandle.getFileHandle('test.txt', { create: true })
        const writable = await testFileHandle.createWritable()
        await writable.write('test')
        await writable.close()
        // Clean up test file
        await dirHandle.removeEntry('test.txt')
      } catch (error) {
        throw new Error('Unable to write to selected directory')
      }

      return true
    } catch (error) {
      console.error('Permission verification failed:', error)
      return false
    }
  }

  const handleDirectorySelect = async () => {
    try {
      // Request permission to access file system
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      })

      // If we already have a path, show confirmation dialog
      if (selectedPath) {
        setPendingDirHandle(dirHandle)
        setIsConfirmOpen(true)
        return
      }

      await processDirectorySelection(dirHandle)

    } catch (error) {
      console.error('Error selecting directory:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to set storage location',
      })
    }
  }

  const processDirectorySelection = async (dirHandle: any) => {
    try {
      // Verify permissions
      const isVerified = await verifyDirectoryPermissions(dirHandle)
      if (!isVerified) {
        toast({
          variant: "destructive",
          title: "Permission Error",
          description: "Full read and write access is required for the selected directory",
        })
        return
      }

      // Get the directory path
      const path = dirHandle.name

      // Update the path in the database
      const result = await updateStoragePath(path, isVerified)

      // Update local state
      setSelectedPath(path)

      // Show success message
      toast({
        title: "Success",
        description: result.message,
      })

    } catch (error) {
      console.error('Error processing directory:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to set storage location',
      })
    } finally {
      // Clear pending state
      setPendingDirHandle(null)
      setIsConfirmOpen(false)
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Current Location</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPath || 'No location selected'}
                    </p>
                  </div>
                  {!selectedPath ? (
                    <Button
                      onClick={handleDirectorySelect}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Select Directory
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDirectorySelect}
                      variant="outline"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Change Directory
                    </Button>
                  )}
                </div>
                {!selectedPath && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-800">
                        Storage location required
                      </p>
                      <p className="text-sm text-amber-700">
                        Please select a directory where you want to store your lectures and notes.
                        You will need to grant full read and write permissions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Storage Location?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the storage location? This will affect where your future lectures and notes are stored.
              Existing files will remain in the current location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDirHandle(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDirHandle && processDirectorySelection(pendingDirHandle)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 