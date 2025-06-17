"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Clock, FileAudio, Calendar, Filter, Check, Upload, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLectures, type Lecture, formatDuration, formatDate } from "@/lib/api"

interface DashboardProps {
  lectures: Lecture[]
  loading: boolean
  error: string | null
  onLectureSelect: (lecture: Lecture) => void
  onUploadClick: () => void
  onBack?: () => void
  selectedFolderId?: string | null
}

export function Dashboard({ lectures, loading, error, onLectureSelect, onUploadClick, onBack, selectedFolderId }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [folderName, setFolderName] = useState<string>("")
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([])
  const [hasProcessingLectures, setHasProcessingLectures] = useState(false)

  const fetchAndUpdateLectures = async () => {
      try {
        const data = await getLectures()
        setFilteredLectures(data)
      // Check if any lectures are still processing
      setHasProcessingLectures(
        data.some(lecture => 
          lecture.status === 'transcribing' || 
          lecture.status === 'generating_notes'
        )
      )
      } catch (err) {
        console.error("Error fetching lectures:", err)
      }
    }

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      await fetchAndUpdateLectures()

      // Set up polling if there are lectures being processed
      if (hasProcessingLectures) {
        pollInterval = setInterval(fetchAndUpdateLectures, 5000) // Poll every 5 seconds
      }
    }

    startPolling()

    // Cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [hasProcessingLectures]) // Restart polling when processing status changes

  // Update filtered lectures when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLectures(lectures)
    } else {
      const filtered = lectures.filter(lecture =>
        lecture.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredLectures(filtered)
    }
  }, [lectures, searchQuery])

  // Fetch folder name when component mounts or selectedFolderId changes
  useEffect(() => {
    const fetchFolderName = async () => {
      if (selectedFolderId) {
        try {
          const response = await fetch(`http://localhost:8000/api/folders/${selectedFolderId}`)
          if (!response.ok) throw new Error("Failed to fetch folder")
          const folder = await response.json()
          setFolderName(folder.name)
        } catch (err) {
          console.error("Error fetching folder:", err)
        }
      }
    }

    fetchFolderName()
  }, [selectedFolderId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          onClick={onUploadClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Upload New Lecture
        </Button>
      </div>
    )
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures yet</h3>
        <p className="text-gray-600 mb-4">Upload your first lecture to get started</p>
        <Button
          onClick={onUploadClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Upload Lecture
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: Lecture["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "transcribing":
      case "generating_notes":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  const formatStatus = (status: Lecture["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-3xl font-bold tracking-tight">
              {selectedFolderId ? folderName : "Dashboard"}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {selectedFolderId 
              ? `Manage lectures in ${folderName}`
              : "Manage your lectures and recordings"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onUploadClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Lecture
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <FileAudio className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lectures</p>
                <p className="text-2xl font-bold text-gray-900">{lectures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lectures.filter((l) => l.status === "transcribing" || l.status === "generating_notes").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    lectures.filter(
                      (l) => new Date(l.created_at).getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lectures.filter((l) => l.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures.map((lecture) => (
          <Card
            key={lecture.id}
            className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
            onClick={() => onLectureSelect(lecture)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{lecture.title}</CardTitle>
                <Badge variant="secondary" className={getStatusColor(lecture.status)}>
                  {formatStatus(lecture.status)}
                </Badge>
              </div>
              {lecture.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{lecture.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(lecture.created_at)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lecture.duration)}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {lecture.transcript ? "Transcript Available" : "Processing Transcript"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {lecture.notes ? "Notes Generated" : "Notes Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLectures.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FileAudio className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Upload your first lecture to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Upload Lecture
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
