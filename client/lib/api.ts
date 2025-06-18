const API_BASE_URL = 'http://localhost:8000/api';

export type SubjectCategory = 
  | "STEM"
  | "HUMANITIES"
  | "SOCIAL_SCIENCES"
  | "BUSINESS"
  | "HEALTH_SCIENCES";

export interface Lecture {
  id: number;
  title: string;
  description: string;
  created_at: string;
  duration: number;
  status: 'completed' | 'failed' | 'transcribing' | 'generating_notes';
  transcript: string | null;
  notes: string | null;
  folder_id: string;
  subject_category: SubjectCategory;
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
  const response = await fetch(`${API_BASE_URL}/lectures`);
  if (!response.ok) {
    throw new Error('Failed to fetch lectures');
  }
  return response.json();
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

export function formatDuration(duration: number): string {
  const minutes = Math.floor(duration)
  const seconds = Math.round((duration - minutes) * 60)
  return `${minutes}m ${seconds}s`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
  return date.toLocaleDateString(undefined, options)
}

export async function generateFlashcards(content: string, cardCount: number) {
  const response = await fetch('/api/flashcards/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lecture_id: content,
      card_count: cardCount,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate flashcards');
  }

  return response.json();
}


