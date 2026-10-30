import { Request, Response, NextFunction } from 'express';
import { SummaryService } from '../services/ai/summary.service.js';
import { QuizService } from '../services/ai/quiz.service.js';
import { MindmapService } from '../services/ai/mindmap.service.js';
import { FlashcardService } from '../services/ai/flashcard.service.js';
import { StudyPlanService } from '../services/ai/study-plan.service.js';
import { AnalyticsService } from '../services/ai/analytics.service.js';
import { successResponse, errorResponse } from '../utils/api-response.js';
import { prisma } from '../config/prisma.js';

export class AIController {
  // SUMMARY
  static async generateSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, type } = req.body;
      if (!documentId) return errorResponse(res, 'documentId is required', 400);

      const summary = await SummaryService.generateSummary(documentId, req.user!.userId, type);
      return successResponse(res, summary, 'Tạo bản tóm tắt tài liệu thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getDocumentSummaries(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.params;
      const summaries = await prisma.summary.findMany({
        where: { documentId },
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(res, summaries, 'Danh sách tóm tắt của tài liệu');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // QUIZ
  static async generateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, courseId, title, difficulty, questionCount, chapter } = req.body;
      if (!documentId) return errorResponse(res, 'documentId is required', 400);

      const quiz = await QuizService.generateQuiz({
        documentId,
        userId: req.user!.userId,
        courseId,
        title,
        difficulty,
        questionCount,
        chapter,
      });

      return successResponse(res, quiz, 'Tạo bộ câu hỏi trắc nghiệm AI thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, courseId } = req.query;
      const quizzes = await prisma.quiz.findMany({
        where: {
          ...(documentId && { documentId: documentId as string }),
          ...(courseId && { courseId: courseId as string }),
        },
        include: {
          document: { select: { id: true, title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(res, quizzes, 'Danh sách bài trắc nghiệm');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getQuizById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: true,
          document: { select: { id: true, title: true } },
        },
      });
      if (!quiz) return errorResponse(res, 'Không tìm thấy Quiz', 404);
      return successResponse(res, quiz, 'Chi tiết Quiz');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { answers } = req.body; // { [questionId]: number }
      if (!answers) return errorResponse(res, 'Vui lòng cung cấp câu trả lời', 400);

      const result = await QuizService.submitQuizAttempt(id, req.user!.userId, answers);
      return successResponse(res, result, 'Hoàn thành bài kiểm tra và chấm điểm thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // MINDMAP
  static async generateMindmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, title } = req.body;
      if (!documentId) return errorResponse(res, 'documentId is required', 400);

      const mindmap = await MindmapService.generateMindmap(documentId, req.user!.userId, title);
      return successResponse(res, mindmap, 'Khởi tạo sơ đồ tư duy AI thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async listMindmaps(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId } = req.query;
      const mindmaps = await prisma.mindmap.findMany({
        where: {
          userId: req.user!.userId,
          ...(documentId && { documentId: documentId as string }),
        },
        include: { document: { select: { id: true, title: true } } },
        orderBy: { updatedAt: 'desc' },
      });
      return successResponse(res, mindmaps, 'Danh sách sơ đồ tư duy');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getMindmapById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mindmap = await prisma.mindmap.findUnique({
        where: { id },
        include: { document: true },
      });
      if (!mindmap) return errorResponse(res, 'Không tìm thấy Mindmap', 404);
      return successResponse(res, mindmap, 'Chi tiết Mindmap');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // FLASHCARDS
  static async generateFlashcards(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentId, title, cardCount } = req.body;
      if (!documentId) return errorResponse(res, 'documentId is required', 400);

      const deck = await FlashcardService.generateFlashcards({
        documentId,
        userId: req.user!.userId,
        title,
        cardCount,
      });

      return successResponse(res, deck, 'Tạo bộ thẻ ghi nhớ AI thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async listFlashcardDecks(req: Request, res: Response, next: NextFunction) {
    try {
      const decks = await prisma.flashcardDeck.findMany({
        where: { userId: req.user!.userId },
        include: {
          document: { select: { id: true, title: true } },
          _count: { select: { cards: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return successResponse(res, decks, 'Danh sách bộ thẻ Flashcard');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getFlashcardDeckById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deck = await prisma.flashcardDeck.findUnique({
        where: { id },
        include: { cards: { orderBy: { order: 'asc' } }, document: true },
      });
      if (!deck) return errorResponse(res, 'Không tìm thấy bộ thẻ Flashcard', 404);
      return successResponse(res, deck, 'Chi tiết bộ thẻ Flashcard');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // STUDY PLAN
  static async generateStudyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject, examDate, targetScore, availableHoursPerDay, currentLevel } = req.body;
      if (!subject || !examDate) {
        return errorResponse(res, 'Vui lòng cung cấp môn học và ngày thi dự kiến', 400);
      }

      const plan = await StudyPlanService.generateStudyPlan({
        userId: req.user!.userId,
        subject,
        examDate,
        targetScore: targetScore || 'Mục tiêu điểm cao (A / 8.5+)',
        availableHoursPerDay: availableHoursPerDay ? parseFloat(availableHoursPerDay) : 2.0,
        currentLevel: currentLevel || 'Trung bình',
      });

      return successResponse(res, plan, 'Kế hoạch học tập AI đã được thiết lập', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getStudyPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.studyPlan.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
      });
      return successResponse(res, plans, 'Danh sách kế hoạch học tập');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // ANALYTICS & RECOMMENDATION
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getUserAnalytics(req.user!.userId);
      return successResponse(res, data, 'Dữ liệu phân tích học tập và tiến độ');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async refreshRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.refreshAIRecommendation(req.user!.userId);
      return successResponse(res, result, 'Đã cập nhật lời khuyên học tập từ AI');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
