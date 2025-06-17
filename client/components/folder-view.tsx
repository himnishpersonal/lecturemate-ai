"use client"

import { useState, useEffect } from "react"
import { Folder, Plus, MoreVertical, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FolderViewProps {
  onFolderSelect: (folderId: string) => void
  onUploadClick: () => void
}

interface FolderType {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  lecture_count: number
}

export function FolderView({ onFolderSelect, onUploadClick }: FolderViewProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newFolder, setNewFolder] = useState({ name: "", description: "" })

  const fetchFolders = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      setFolders(data)
    } catch (err) {
      setError("Failed to load folders")
      console.error("Error fetching folders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleCreateFolder = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFolder),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      await fetchFolders()
      setIsCreateOpen(false)
      setNewFolder({ name: "", description: "" })
    } catch (err) {
      console.error("Error creating folder:", err)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/folders/${folderId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete folder")

      await fetchFolders()
    } catch (err) {
      console.error("Error deleting folder:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Folders</h1>
          <p className="text-muted-foreground">Organize your lectures into folders</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your lectures.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Folder Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter folder name"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter folder description"
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700">
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={onUploadClick} variant="outline" className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Upload Lecture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onFolderSelect(folder.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                    {folder.description && (
                      <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}>
                      Delete Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Folder className="h-4 w-4" />
                {folder.lecture_count} {folder.lecture_count === 1 ? "lecture" : "lectures"}
              </div>
            </CardContent>
          </Card>
        ))}

        {folders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No folders yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first folder to organize your lectures
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 