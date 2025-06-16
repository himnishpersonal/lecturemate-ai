import { createClient } from '@supabase/supabase-js'

const API_BASE_URL = 'http://localhost:8000/api';

export type Lecture = {
  id: string
  title: string
  description: string | null
  audio_url: string  // Physical path to audio file
  transcript: string | null  // Physical path to transcript file
  notes: string | null  // Physical path to notes file
  status: 'pending' | 'transcribing' | 'generating_notes' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  duration: number
  user_id: string
  folder_id: string
}

export async function uploadLecture(file: File, title: string, description?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`${API_BASE_URL}/lectures/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload lecture');
  }

  return response.json();
}

export async function getLectures(): Promise<Lecture[]> {
  try {
    const response = await fetch('http://localhost:8000/api/lectures')
  if (!response.ok) {
      if (response.status === 404) {
        // Return empty array if no lectures found
        return []
      }
      throw new Error('Failed to fetch lectures')
  }
    const data = await response.json()
    return data || [] // Return empty array if response is null/undefined
  } catch (error) {
    console.error('Error fetching lectures:', error)
    throw error
  }
}

export async function getLectureById(id: string): Promise<Lecture> {
  const response = await fetch(`${API_BASE_URL}/lectures/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lecture');
  }
  return response.json();
}

export async function getLecture(id: number): Promise<Lecture> {
  const response = await fetch(`${API_BASE_URL}/lectures/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lecture');
  }
  return response.json();
}

export async function deleteLecture(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lectures/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete lecture');
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Function to read file contents
export async function readFileContents(filePath: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:8000/api/files/read?path=${encodeURIComponent(filePath)}`)
    if (!response.ok) throw new Error('Failed to read file')
    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
}


