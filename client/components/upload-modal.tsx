"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Loader2, X } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Folder {
  id: string
  name: string
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [folderId, setFolderId] = useState<string>("")
  const [folders, setFolders] = useState<Folder[]>([])
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/folders")
        if (!response.ok) throw new Error("Failed to fetch folders")
        const data = await response.json()
        setFolders(data)
        console.log("Fetched folders:", data)
      } catch (err) {
        console.error("Error fetching folders:", err)
        setError("Failed to load folders")
      } finally {
        setLoadingFolders(false)
      }
    }

    if (isOpen) {
      fetchFolders()
    }
  }, [isOpen])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type === 'video/mp4')) {
      setFile(droppedFile)
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""))
      }
      setError(null)
    } else {
      setError('Please upload an audio or MP4 file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type.startsWith('audio/') || selectedFile.type === 'video/mp4') {
      setFile(selectedFile)
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
        }
      setError(null)
    } else {
      setError('Please upload an audio or MP4 file')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission state:', {
      file: file?.name,
      title,
      description,
      folderId,
      folders
    })

    if (!file || !folderId) {
      const errorMsg = !file ? 'Please select a file' : 'Please select a folder'
      setError(errorMsg)
      console.log('Validation error:', errorMsg)
      return
    }

    setUploading(true)
    
    try {
      // Create form data
      const formData = new FormData()
      
      // Add file and metadata as form fields
      formData.append("file", file)
      formData.append("folder_id", folderId)  // This must match the FastAPI Form parameter name
      
      // Only append title if it's different from the filename
      if (title && title !== file.name) {
        formData.append("title", title)
      }
      
      if (description) {
        formData.append("description", description)
      }

      // Log form data for debugging
      console.log('Sending form data:')
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? value.name : value)
      }

      const response = await fetch("http://localhost:8000/api/lectures/upload", {
        method: "POST",
        body: formData
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          sentFolderId: folderId
        })
        
        // Get the raw response text for debugging
        const rawResponse = await response.text()
        console.log('Raw response:', rawResponse)
        
        throw new Error(errorData.detail || "Upload failed")
      }

      const responseData = await response.json()
      console.log('Upload successful:', responseData)
      onSuccess()
      handleClose()
    } catch (err) {
      console.error("Error uploading:", err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setError(null)
    setFolderId("")
    onClose()
  }

  const handleFolderSelect = (value: string) => {
    console.log('Selected folder value:', value)
    setFolderId(value)
    // Log the folder details to verify the selection
    const selectedFolder = folders.find(folder => folder.id === value)
    console.log('Selected folder details:', selectedFolder)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Lecture</DialogTitle>
          <DialogDescription>
            Upload an audio or video file to transcribe and generate notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="folder">Folder</Label>
              <Select 
                value={folderId} 
                onValueChange={handleFolderSelect}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {loadingFolders ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : folders.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No folders available. Create a folder first.
                    </div>
                  ) : (
                    folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              </div>

              <div>
              <Label htmlFor="file">File</Label>
              <div 
                className={`mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                  const droppedFile = e.dataTransfer.files[0]
                  if (droppedFile) {
                    setFile(droppedFile)
                    setTitle(droppedFile.name)
                  }
                }}
              >
                <div className="text-center">
                {file ? (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setFile(null)
                          setTitle("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="audio/*,video/*"
                            onChange={(e) => {
                              const selectedFile = e.target.files?.[0]
                              if (selectedFile) {
                                setFile(selectedFile)
                                setTitle(selectedFile.name)
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        Audio or video files up to 500MB
                      </p>
                    </div>
                )}
              </div>
            </div>
          </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your lecture"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your lecture"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !folderId || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
