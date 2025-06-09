"use client"

import { useState, useEffect } from "react"
import { BookOpen, Upload, Search, Settings, Home, FileText, Brain, Zap, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  onUploadClick: () => void
  onDashboardClick: () => void
  onSearchClick: () => void
  onNotesClick: () => void
  currentView: "dashboard" | "lecture" | "search" | "notes"
}

export function AppSidebar({ onUploadClick, onDashboardClick, onSearchClick, onNotesClick, currentView }: AppSidebarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">LectureMate</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Notes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onDashboardClick} isActive={currentView === "dashboard"} className="w-full">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSearchClick} isActive={currentView === "search"} className="w-full">
                  <Search className="h-4 w-4" />
                  <span>Search Lectures</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNotesClick} isActive={currentView === "notes"} className="w-full">
                  <FileText className="h-4 w-4" />
                  <span>My Notes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button onClick={onUploadClick} className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4" />
              Upload Lecture
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-full justify-start"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              )}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <Zap className="h-4 w-4" />
                  <span>Flashcards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  <BookOpen className="h-4 w-4" />
                  <span>Export PDF</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
