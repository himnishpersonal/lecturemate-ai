"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { LectureView } from "@/components/lecture-view"
import { UploadModal } from "@/components/upload-modal"
import type { Lecture } from "@/lib/api"
import "./App.css"

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "lecture">("dashboard")
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleLectureSelect = (lecture: Lecture) => {
    setSelectedLecture(lecture)
    setCurrentView("lecture")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedLecture(null)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AppSidebar
          onUploadClick={() => setIsUploadOpen(true)}
          onDashboardClick={handleBackToDashboard}
          currentView={currentView}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl">
            {currentView === "dashboard" ? (
              <Dashboard onLectureSelect={handleLectureSelect} onUploadClick={() => setIsUploadOpen(true)} />
            ) : selectedLecture ? (
              <LectureView lecture={selectedLecture} onBack={handleBackToDashboard} />
            ) : null}
          </div>
        </main>
        <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      </div>
    </SidebarProvider>
  )
}
