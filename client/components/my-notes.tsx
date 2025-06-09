"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, Calendar, Download, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLectures, type Lecture, formatDuration, formatDate } from "@/lib/api"

interface MyNotesProps {
  onLectureSelect: (lecture: Lecture) => void
}

export function MyNotes({ onLectureSelect }: MyNotesProps) {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const data = await getLectures()
        // Only show lectures that have completed notes
        const completedLectures = data.filter(
          lecture => lecture.status === "completed" && lecture.notes
        )
        setLectures(completedLectures)
      } catch (err) {
        setError("Failed to load lectures")
        console.error("Error fetching lectures:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLectures()
  }, [])

  const handleDownloadPDF = async (lecture: Lecture) => {
    if (!lecture.notes) return;
  
    try {
      const html2pdf = (await import('html2pdf.js')).default;
  
      const element = document.createElement('div');
      element.innerHTML = lecture.notes;
      element.className = 'lecture-notes';
      document.body.appendChild(element);
      const opt = {
        margin: 1,
        filename: `${lecture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
  
      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground mb-2">My Notes</h1>
        <p className="text-muted-foreground">Access and manage your AI-generated lecture notes</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {lectures.map((lecture) => (
          <Card
            key={lecture.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg hover:text-primary cursor-pointer" onClick={() => onLectureSelect(lecture)}>
                    {lecture.title}
                  </CardTitle>
                  {lecture.description && (
                    <p className="text-sm text-muted-foreground">{lecture.description}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadPDF(lecture)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(lecture.created_at)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDuration(lecture.duration)}
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Note Preview</h4>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: lecture.notes || 'No notes available.'
                    }} 
                  />
                  <Button
                    variant="link"
                    className="mt-2 h-auto p-0"
                    onClick={() => onLectureSelect(lecture)}
                  >
                    View Full Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {lectures.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No notes available</h3>
            <p className="text-muted-foreground">
              Upload and process lectures to generate AI notes
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 