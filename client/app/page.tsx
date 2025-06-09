"use client"

import { useState, useEffect } from "react"
import { getLectures, type Lecture } from "@/lib/api"
import { Dashboard } from "@/components/dashboard"
import { LectureView } from "@/components/lecture-view"
import { SearchLectures } from "@/components/search-lectures"
import { MyNotes } from "@/components/my-notes"
import { UploadModal } from "@/components/upload-modal"
import { AppSidebar } from "@/components/app-sidebar"

export default function Home() {
  const [currentView, setCurrentView] = useState<"dashboard" | "lecture" | "search" | "notes">("dashboard")
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const data = await getLectures()
        setLectures(data)
      } catch (err) {
        setError("Failed to load lectures")
        console.error("Error fetching lectures:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLectures()
  }, [])

  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture)
    setCurrentView("lecture")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedLecture(null)
  }

  const handleUploadSuccess = async () => {
    setIsUploadOpen(false)
    setLoading(true)
    try {
      const data = await getLectures()
      setLectures(data)
    } catch (err) {
      console.error("Error refreshing lectures:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view)
    if (view !== "lecture") {
      setSelectedLecture(null)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        onUploadClick={() => setIsUploadOpen(true)}
        onDashboardClick={() => handleViewChange("dashboard")}
        onSearchClick={() => handleViewChange("search")}
        onNotesClick={() => handleViewChange("notes")}
        currentView={currentView}
      />
      <main className="flex-1 overflow-y-auto">
        {currentView === "dashboard" ? (
          <Dashboard 
            lectures={lectures}
            loading={loading}
            error={error}
            onLectureSelect={handleLectureSelect} 
            onUploadClick={() => setIsUploadOpen(true)} 
          />
        ) : currentView === "search" ? (
          <SearchLectures onLectureSelect={handleLectureSelect} />
        ) : currentView === "notes" ? (
          <MyNotes onLectureSelect={handleLectureSelect} />
        ) : selectedLecture ? (
          <LectureView lecture={selectedLecture} onBack={handleBackToDashboard} />
        ) : null}
      </main>
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
