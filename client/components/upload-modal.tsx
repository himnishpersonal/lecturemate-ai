"use client"

import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"
import { uploadLecture } from "@/lib/api"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const getDefaultTitle = (filename: string) => {
    // Remove file extension and replace underscores/hyphens with spaces
    return filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type === 'video/mp4')) {
      setFile(droppedFile)
      // Only set title if it's empty
      if (!title) {
        setTitle(getDefaultTitle(droppedFile.name))
      }
      setError(null)
    } else {
      setError('Please upload an audio or MP4 file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && (selectedFile.type.startsWith('audio/') || selectedFile.type === 'video/mp4')) {
      setFile(selectedFile)
      // Only set title if it's empty
      if (!title) {
        setTitle(getDefaultTitle(selectedFile.name))
      }
      setError(null)
    } else {
      setError('Please upload an audio or MP4 file')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      setError('Please provide both a file and title')
      return
    }

    setUploading(true)
    setError(null)

    try {
      await uploadLecture(file, title, description)
      onSuccess()
      onClose()
    } catch (err) {
      setError('Failed to upload lecture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-xl w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Upload Lecture</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="rounded-full bg-blue-50 w-16 h-16 flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                {file ? (
                  <>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-900">Drop your lecture file here</p>
                    <p className="text-gray-500 mt-1">or click to browse</p>
                  </>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">MP3</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">MP4</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">WAV</span>
              </div>
              <input
                type="file"
                accept="audio/*,video/mp4"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block cursor-pointer"
              >
                <div 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse Files
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter lecture title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes about this lecture"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={uploading || !file || !title}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
