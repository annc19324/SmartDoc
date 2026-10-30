import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { MainLayout } from '../components/layout/MainLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { DocumentListPage } from '../pages/documents/DocumentListPage';
import { DocumentDetailPage } from '../pages/documents/DocumentDetailPage';
import { DocumentUploadPage } from '../pages/documents/DocumentUploadPage';
import { SmartSearchPage } from '../pages/search/SmartSearchPage';
import { ChatPage } from '../pages/chat/ChatPage';
import { SummaryPage } from '../pages/summary/SummaryPage';
import { QuizListPage } from '../pages/quiz/QuizListPage';
import { QuizDetailPage } from '../pages/quiz/QuizDetailPage';
import { FlashcardsPage } from '../pages/flashcards/FlashcardsPage';
import { MindmapPage } from '../pages/mindmap/MindmapPage';
import { StudyPlanPage } from '../pages/study-plan/StudyPlanPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { TeacherCoursesPage } from '../pages/teacher/TeacherCoursesPage';
import { AdminMetricsPage } from '../pages/admin/AdminMetricsPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Documents */}
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />

          {/* AI Tools & RAG */}
          <Route path="/search" element={<SmartSearchPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/quiz" element={<QuizListPage />} />
          <Route path="/quiz/:id" element={<QuizDetailPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/mindmap" element={<MindmapPage />} />
          <Route path="/study-plan" element={<StudyPlanPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Teacher Only */}
          <Route element={<RoleRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          </Route>

          {/* Admin Only */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/metrics" element={<AdminMetricsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
