export interface Lecture {
  id: string;
  title: string;
  transcript?: string;
  notes?: string;
  created_at: string;
  status: string;
}

export interface Flashcard {
  question: string;
  answer: string;
} 