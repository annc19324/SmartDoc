import { apiClient } from './client';
import {
  User,
  Document,
  DocumentStatus,
  ChatSession,
  ChatMessage,
  RAGSource,
  Summary,
  SummaryType,
  Quiz,
  QuizAttemptResult,
  FlashcardDeck,
  Mindmap,
  StudyPlan,
  LearningAnalytics,
  Course,
  Category,
  NotificationItem,
} from '../../types';

// ================= AUTH API =================
export const authApi = {
  login: async (credentials: any) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data.data;
  },
  register: async (data: any) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },
  logout: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/logout', { refreshToken });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data.data;
  },
};

// ================= DOCUMENTS API =================
export const documentApi = {
  list: async (params?: { search?: string; categoryId?: string; courseId?: string; status?: DocumentStatus; page?: number; limit?: number }) => {
    const res = await apiClient.get('/documents', { params });
    return {
      documents: res.data.data as Document[],
      pagination: res.data.pagination,
    };
  },
  getById: async (id: string): Promise<Document> => {
    const res = await apiClient.get(`/documents/${id}`);
    return res.data.data;
  },
  upload: async (formData: FormData): Promise<Document> => {
    const res = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  smartSearch: async (query: string, limit: number = 8) => {
    const res = await apiClient.get('/documents/smart-search', { params: { q: query, limit } });
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },
};

// ================= CHAT API (RAG) =================
export const chatApi = {
  listSessions: async (): Promise<ChatSession[]> => {
    const res = await apiClient.get('/chat/sessions');
    return res.data.data;
  },
  createSession: async (title?: string, documentId?: string): Promise<ChatSession> => {
    const res = await apiClient.post('/chat/sessions', { title, documentId });
    return res.data.data;
  },
  getSession: async (id: string): Promise<ChatSession> => {
    const res = await apiClient.get(`/chat/sessions/${id}`);
    return res.data.data;
  },
  sendMessage: async (sessionId: string, question: string): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    sources: RAGSource[];
  }> => {
    const res = await apiClient.post(`/chat/sessions/${sessionId}/messages`, { question });
    return res.data.data;
  },
  deleteSession: async (sessionId: string) => {
    const res = await apiClient.delete(`/chat/sessions/${sessionId}`);
    return res.data;
  },
};

// ================= AI FEATURES API =================
export const aiApi = {
  // Summaries
  generateSummary: async (documentId: string, type: SummaryType = 'DETAILED'): Promise<Summary> => {
    const res = await apiClient.post('/ai/summary', { documentId, type });
    return res.data.data;
  },
  getDocumentSummaries: async (documentId: string): Promise<Summary[]> => {
    const res = await apiClient.get(`/ai/summary/${documentId}`);
    return res.data.data;
  },

  // Quizzes
  generateQuiz: async (payload: { documentId: string; courseId?: string; title?: string; difficulty?: string; questionCount?: number; chapter?: string }): Promise<Quiz> => {
    const res = await apiClient.post('/ai/quiz/generate', payload);
    return res.data.data;
  },
  listQuizzes: async (params?: { documentId?: string; courseId?: string }): Promise<Quiz[]> => {
    const res = await apiClient.get('/ai/quizzes', { params });
    return res.data.data;
  },
  getQuizById: async (id: string): Promise<Quiz> => {
    const res = await apiClient.get(`/ai/quizzes/${id}`);
    return res.data.data;
  },
  submitQuiz: async (id: string, answers: Record<string, number>): Promise<QuizAttemptResult> => {
    const res = await apiClient.post(`/ai/quizzes/${id}/submit`, { answers });
    return res.data.data;
  },

  // Mindmaps
  generateMindmap: async (documentId: string, title?: string): Promise<Mindmap> => {
    const res = await apiClient.post('/ai/mindmap/generate', { documentId, title });
    return res.data.data;
  },
  listMindmaps: async (documentId?: string): Promise<Mindmap[]> => {
    const res = await apiClient.get('/ai/mindmaps', { params: { documentId } });
    return res.data.data;
  },
  getMindmapById: async (id: string): Promise<Mindmap> => {
    const res = await apiClient.get(`/ai/mindmaps/${id}`);
    return res.data.data;
  },

  // Flashcards
  generateFlashcards: async (payload: { documentId: string; title?: string; cardCount?: number }): Promise<FlashcardDeck> => {
    const res = await apiClient.post('/ai/flashcards/generate', payload);
    return res.data.data;
  },
  listFlashcardDecks: async (): Promise<FlashcardDeck[]> => {
    const res = await apiClient.get('/ai/flashcards/decks');
    return res.data.data;
  },
  getFlashcardDeckById: async (id: string): Promise<FlashcardDeck> => {
    const res = await apiClient.get(`/ai/flashcards/decks/${id}`);
    return res.data.data;
  },

  // Study Plan
  generateStudyPlan: async (payload: { subject: string; examDate: string; targetScore?: string; availableHoursPerDay?: number; currentLevel?: string }): Promise<StudyPlan> => {
    const res = await apiClient.post('/ai/study-plan/generate', payload);
    return res.data.data;
  },
  getStudyPlans: async (): Promise<StudyPlan[]> => {
    const res = await apiClient.get('/ai/study-plans');
    return res.data.data;
  },

  // Analytics & Recommendation
  getAnalytics: async (): Promise<{ analytics: LearningAnalytics; recentAttempts: any[]; studyProgress: any[] }> => {
    const res = await apiClient.get('/ai/analytics');
    return res.data.data;
  },
  refreshRecommendation: async (): Promise<LearningAnalytics> => {
    const res = await apiClient.post('/ai/analytics/recommendation/refresh');
    return res.data.data;
  },
};

// ================= SYSTEM / COURSES / ADMIN =================
export const systemApi = {
  listCourses: async (search?: string): Promise<Course[]> => {
    const res = await apiClient.get('/courses', { params: { search } });
    return res.data.data;
  },
  getCourseById: async (id: string): Promise<Course> => {
    const res = await apiClient.get(`/courses/${id}`);
    return res.data.data;
  },
  createCourse: async (data: any): Promise<Course> => {
    const res = await apiClient.post('/courses', data);
    return res.data.data;
  },
  listCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data.data;
  },
  listNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/notifications');
    return res.data.data;
  },
  markNotificationAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },
  // Admin
  getAdminMetrics: async () => {
    const res = await apiClient.get('/admin/metrics');
    return res.data.data;
  },
  listAdminUsers: async (params?: { search?: string; role?: string }) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data.data;
  },
  toggleUserStatus: async (id: string, isActive: boolean) => {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    return res.data.data;
  },
  changeUserRole: async (id: string, role: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res.data.data;
  },
};
