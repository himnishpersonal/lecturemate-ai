"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Clock, 
  Folder, 
  FileText, 
  Brain, 
  Calendar,
  ArrowUpRight,
  Plus,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getLectures, type Lecture } from "@/lib/api"

interface OverviewDashboardProps {
  onFolderClick: () => void
  onUploadClick: () => void
  onLectureSelect: (lecture: Lecture) => void
}

export function OverviewDashboard({ onFolderClick, onUploadClick, onLectureSelect }: OverviewDashboardProps) {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalLectures: 0,
    totalDuration: 0,
    completedLectures: 0,
    processingLectures: 0,
    averageLength: 0,
    recentActivity: [] as Lecture[],
  })

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const data = await getLectures()
        setLectures(data)
        
        // Calculate statistics
        const totalLectures = data.length
        const totalDuration = data.reduce((acc, lecture) => acc + (lecture.duration || 0), 0)
        const completedLectures = data.filter(l => l.status === 'completed').length
        const processingLectures = data.filter(l => 
          l.status === 'transcribing' || l.status === 'generating_notes'
        ).length
        const averageLength = totalLectures ? Math.round(totalDuration / totalLectures) : 0
        
        // Get recent activity (last 5 lectures)
        const recentActivity = [...data]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setStats({
          totalLectures,
          totalDuration,
          completedLectures,
          processingLectures,
          averageLength,
          recentActivity,
        })
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error("Error fetching lectures:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLectures()
  }, [])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your lecture analytics and recent activity</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button onClick={onUploadClick} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" />
          Upload New Lecture
        </Button>
        <Button variant="outline" onClick={onFolderClick} className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700 gap-2">
          <Folder className="h-4 w-4" />
          View Folders
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLectures}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedLectures} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {formatDuration(stats.averageLength)} per lecture
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingLectures}</div>
            <Progress 
              value={(stats.completedLectures / stats.totalLectures) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notes Generated</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLectures}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedLectures / stats.totalLectures) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {stats.recentActivity.map((lecture) => (
              <div
                key={lecture.id}
                className="flex items-center cursor-pointer hover:bg-muted rounded-lg p-2"
                onClick={() => onLectureSelect(lecture)}
              >
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none">{lecture.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(lecture.duration)} • {formatDate(lecture.created_at)}
                  </p>
                </div>
                <div className={`
                  px-2 py-1 rounded text-xs
                  ${lecture.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                  }
                `}>
                  {lecture.status === 'completed' ? 'Completed' : 'Processing'}
                </div>
                <ArrowUpRight className="h-4 w-4 ml-2 text-muted-foreground" />
              </div>
            ))}

            {stats.recentActivity.length === 0 && (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
                <p className="text-muted-foreground">
                  Upload your first lecture to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 