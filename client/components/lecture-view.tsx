"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Share, Clock, Calendar, FileText, Brain, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getLectureById, type Lecture, formatDuration, formatDate } from "@/lib/api"


interface LectureViewProps {
  lecture: Lecture
  onBack: () => void
}

export function LectureView({ lecture, onBack }: LectureViewProps) {
  const [copiedTranscript, setCopiedTranscript] = useState(false)
  const [copiedNotes, setCopiedNotes] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullLecture, setFullLecture] = useState<Lecture | null>(null)

  const fetchLectureDetails = async () => {
    try {
      const data = await getLectureById(String(lecture.id))
      setFullLecture(data)
      return data.status
    } catch (err) {
      setError("Failed to load lecture details")
      console.error("Error fetching lecture details:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      const status = await fetchLectureDetails()
      
      if (status && status !== 'completed' && status !== 'failed') {
        pollInterval = setInterval(async () => {
          const newStatus = await fetchLectureDetails()
          if (newStatus === 'completed' || newStatus === 'failed') {
            if (pollInterval) {
              clearInterval(pollInterval)
            }
          }
        }, 5000)
      }
    }

    startPolling()

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [lecture.id])

  const handleCopyTranscript = async () => {
    if (!fullLecture?.transcript) return
    await navigator.clipboard.writeText(fullLecture.transcript)
    setCopiedTranscript(true)
    setTimeout(() => setCopiedTranscript(false), 2000)
  }

  const handleCopyNotes = async () => {
    if (!fullLecture?.notes) return
    await navigator.clipboard.writeText(fullLecture.notes)
    setCopiedNotes(true)
    setTimeout(() => setCopiedNotes(false), 2000)
  }

  const handleDownloadPDF = async () => {
    if (!fullLecture?.notes) return;
    setDownloading(true);
  
    try {
      const html2pdf = (await import('html2pdf.js')).default;
  
      const element = document.createElement('div');
      element.innerHTML = fullLecture.notes;
      element.className = 'lecture-notes';
      document.body.appendChild(element);
      const opt = {
        margin: 1,
        filename: `${fullLecture.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
  
      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };
  

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
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading lecture details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !fullLecture) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Failed to load lecture details</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-4">{fullLecture.title}</h1>
          {fullLecture.description && (
            <p className="text-muted-foreground text-lg">{fullLecture.description}</p>
          )}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-5 w-5 mr-2" />
              {formatDate(fullLecture.created_at)}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-5 w-5 mr-2" />
              {formatDuration(fullLecture.duration)}
            </div>
          </div>
        </div>

        {fullLecture.status !== 'completed' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-blue-900 mb-2">Processing Lecture</h2>
            <p className="text-blue-700">
              {fullLecture.status === 'transcribing'
                ? 'Your lecture is being transcribed. This may take a few minutes...'
                : 'Generating lecture notes. This may take a few minutes...'}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="transcript" className="text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Transcript
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-lg">
                <Brain className="h-5 w-5 mr-2" />
                AI Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">Full Transcript</h2>
                  </div>
                  <Button
                    onClick={handleCopyTranscript}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!fullLecture?.transcript}
                  >
                    {copiedTranscript ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedTranscript ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <div className="prose max-w-none">
                  {fullLecture.transcript ? (
                    <p className="whitespace-pre-wrap text-foreground">{fullLecture.transcript}</p>
                  ) : (
                    <p className="text-muted-foreground">No transcript available.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold text-foreground">AI-Generated Notes</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={!fullLecture?.notes || downloading}
                    >
                      {downloading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCopyNotes}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={!fullLecture?.notes}
                    >
                      {copiedNotes ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedNotes ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div className="prose max-w-none">
                  {fullLecture?.notes ? (
                    <div className="text-foreground" dangerouslySetInnerHTML={{ __html: fullLecture.notes }} />
                  ) : (
                    <p className="text-muted-foreground">No notes available.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
