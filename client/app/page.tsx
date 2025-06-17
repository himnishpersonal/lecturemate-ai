"use client"

import { useState, useEffect } from "react"
import { getLectures, type Lecture } from "@/lib/api"
import { Dashboard } from "@/components/dashboard"
import { LectureView } from "@/components/lecture-view"
import { SearchLectures } from "@/components/search-lectures"
import { MyNotes } from "@/components/my-notes"
import { FolderView } from "@/components/folder-view"
import { OverviewDashboard } from "@/components/overview-dashboard"
import { UploadModal } from "@/components/upload-modal"
import { AppSidebar } from "@/components/app-sidebar"

type View = "overview" | "folders" | "folder" | "lecture" | "search" | "notes"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("overview")
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
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

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    setCurrentView("folder")
  }

  const handleBack = () => {
    if (currentView === "lecture" && selectedFolderId) {
      setCurrentView("folder")
      setSelectedLecture(null)
    } else {
      setCurrentView("overview")
      setSelectedLecture(null)
      setSelectedFolderId(null)
    }
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

  const getFolderLectures = (folderId: string) => {
    return lectures.filter(lecture => lecture.folder_id === folderId)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        onUploadClick={() => setIsUploadOpen(true)}
        onDashboardClick={() => setCurrentView("overview")}
        onFoldersClick={() => setCurrentView("folders")}
        onSearchClick={() => setCurrentView("search")}
        onNotesClick={() => setCurrentView("notes")}
        currentView={currentView}
      />
      <main className="flex-1 overflow-y-auto">
        {currentView === "overview" ? (
          <OverviewDashboard 
            onFolderClick={() => setCurrentView("folders")}
            onUploadClick={() => setIsUploadOpen(true)}
            onLectureSelect={handleLectureSelect}
          />
        ) : currentView === "folders" ? (
          <FolderView 
            onFolderSelect={handleFolderSelect}
            onUploadClick={() => setIsUploadOpen(true)}
          />
        ) : currentView === "folder" && selectedFolderId ? (
          <Dashboard 
            lectures={getFolderLectures(selectedFolderId)}
            loading={loading}
            error={error}
            onLectureSelect={handleLectureSelect}
            onUploadClick={() => setIsUploadOpen(true)}
            onBack={handleBack}
            selectedFolderId={selectedFolderId}
          />
        ) : currentView === "search" ? (
          <SearchLectures onLectureSelect={handleLectureSelect} />
        ) : currentView === "notes" ? (
          <MyNotes onLectureSelect={handleLectureSelect} />
        ) : selectedLecture ? (
          <LectureView lecture={selectedLecture} onBack={handleBack} />
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
