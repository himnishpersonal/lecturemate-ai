"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Clock, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLectures, type Lecture, formatDuration, formatDate } from "@/lib/api"

interface SearchLecturesProps {
  onLectureSelect: (lecture: Lecture) => void
}

export function SearchLectures({ onLectureSelect }: SearchLecturesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([])

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const data = await getLectures()
        setLectures(data)
        setFilteredLectures(data)
      } catch (err) {
        setError("Failed to load lectures")
        console.error("Error fetching lectures:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLectures()
  }, [])

  // Update filtered lectures when search query changes
  useEffect(() => {
    const searchTerms = searchQuery.toLowerCase().split(" ")
    const filtered = lectures.filter((lecture) => {
      const titleMatch = searchTerms.every(term =>
        lecture.title.toLowerCase().includes(term)
      )
      const transcriptMatch = lecture.transcript
        ? searchTerms.every(term =>
            lecture.transcript!.toLowerCase().includes(term)
          )
        : false
      const notesMatch = lecture.notes
        ? searchTerms.every(term =>
            lecture.notes!.toLowerCase().includes(term)
          )
        : false

      return titleMatch || transcriptMatch || notesMatch
    })
    setFilteredLectures(filtered)
  }, [lectures, searchQuery])

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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Search Lectures</h1>
        <p className="text-muted-foreground">Search through your lecture transcripts and notes</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by title, transcript, or notes content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredLectures.map((lecture) => (
          <Card
            key={lecture.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onLectureSelect(lecture)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{lecture.title}</CardTitle>
                <Badge variant="secondary" className={getStatusColor(lecture.status)}>
                  {formatStatus(lecture.status)}
                </Badge>
              </div>
              {lecture.description && (
                <p className="text-sm text-muted-foreground mt-1">{lecture.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(lecture.created_at)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lecture.duration)}
                </div>
                {searchQuery && lecture.transcript && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Matching Content
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {lecture.transcript}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLectures.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No lectures found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 