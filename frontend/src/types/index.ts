export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type DocumentStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SummaryType = 'SHORT' | 'DETAILED' | 'KEY_POINTS' | 'IMPORTANT_TERMS' | 'EXAM_REVIEW';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string | null;
  isActive?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { documents: number; courses: number };
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  thumbnail?: string;
  teacherId: string;
  teacher?: User;
  categoryId?: string;
  category?: Category;
  documents?: Document[];
  quizzes?: Quiz[];
  _count?: { documents: number; quizzes: number };
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnail?: string;
  pageCount: number;
  status: DocumentStatus;
  errorMessage?: string;
  viewCount: number;
  downloadCount: number;
  courseId?: string;
  course?: Course;
  categoryId?: string;
  category?: Category;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chunks: number;
    summaries: number;
    quizzes: number;
    flashcardDecks: number;
    mindmaps: number;
  };
}

export interface RAGSource {
  documentId: string;
  documentName: string;
  pageNumber: number;
  contentSnippet: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RAGSource[] | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  documentId?: string | null;
  document?: { id: string; title: string } | null;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface Summary {
  id: string;
  documentId: string;
  type: SummaryType;
  content: string;
  keyPoints?: string[];
  importantTerms?: { term: string; definition: string }[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: QuizDifficulty;
  documentId?: string;
  document?: { id: string; title: string };
  courseId?: string;
  questions?: QuizQuestion[];
  _count?: { questions: number; attempts: number };
  createdAt: string;
}

export interface QuizAttemptResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  questionsWithAnswers: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  order: number;
  isMastered: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description?: string;
  documentId?: string;
  document?: { id: string; title: string };
  cards?: Flashcard[];
  _count?: { cards: number };
  createdAt: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindmapNode[];
}

export interface Mindmap {
  id: string;
  title: string;
  documentId?: string;
  document?: Document;
  treeData: MindmapNode;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanDay {
  day: number;
  topic: string;
  tasks: string[];
  estimatedHours: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  examDate: string;
  targetScore: string;
  availableHoursPerDay: number;
  currentLevel: string;
  planData: StudyPlanDay[];
  createdAt: string;
}

export interface LearningAnalytics {
  id: string;
  userId: string;
  totalStudyMinutes: number;
  quizzesTaken: number;
  averageQuizScore: number;
  flashcardsReviewed: number;
  documentsViewed: number;
  strongTopics?: string[];
  weakTopics?: string[];
  aiRecommendation?: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
