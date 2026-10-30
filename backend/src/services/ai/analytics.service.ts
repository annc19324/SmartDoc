import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';

export class AnalyticsService {
  static async getUserAnalytics(userId: string) {
    // 1. Fetch or initialize analytics record
    let analytics = await prisma.learningAnalytics.findUnique({
      where: { userId },
    });

    if (!analytics) {
      analytics = await prisma.learningAnalytics.create({
        data: {
          userId,
          totalStudyMinutes: 120,
          quizzesTaken: 1,
          averageQuizScore: 7.5,
          flashcardsReviewed: 20,
          documentsViewed: 3,
          strongTopics: ['Lập trình cơ bản', 'Cấu trúc mảng'],
          weakTopics: ['Cây nhị phân'],
          aiRecommendation: 'Chào mừng bạn đến với SmartDoc! Hãy bắt đầu bằng cách đọc tài liệu và làm các bài quiz ngắn.',
        },
      });
    }

    // 2. Fetch recent quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 3. Fetch documents view progress
    const progressList = await prisma.studyProgress.findMany({
      where: { userId },
      include: { document: true },
    });

    return {
      analytics,
      recentAttempts: attempts,
      studyProgress: progressList,
    };
  }

  static async refreshAIRecommendation(userId: string) {
    const analytics = await prisma.learningAnalytics.findUnique({ where: { userId } });
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: { include: { questions: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentScores = attempts.map((a) => `Quiz "${a.quiz.title}": ${a.score}/10`).join(', ');

    const prompt = `Phân tích kết quả học tập của sinh viên:
- Điểm trung bình Quiz: ${analytics?.averageQuizScore || 7.0}
- Lịch sử làm bài gần đây: ${recentScores || 'Chưa làm nhiều quiz'}
- Điểm mạnh hiện tại: ${(analytics?.strongTopics as string[])?.join(', ') || 'Chưa xác định'}
- Điểm yếu hiện tại: ${(analytics?.weakTopics as string[])?.join(', ') || 'Chưa xác định'}

YÊU CẦU:
Đưa ra 1 nhận xét sư phạm ngắn gọn (khoảng 2-3 câu) kèm lời khuyên hành động cụ thể để sinh viên cải thiện điểm số và lỗ hổng kiến thức.

Ví dụ phong cách: "Bạn đang nắm tốt phần Quick Sort nhưng còn gặp khó khăn với thuật toán Dijkstra. Hãy xem lại Chương 4 của tài liệu DSA và làm bài kiểm tra 5 câu để củng cố trước khi chuyển sang chủ đề Đồ thị nâng cao."`;

    const recommendation = await GeminiService.generateText(prompt);

    const updated = await prisma.learningAnalytics.update({
      where: { userId },
      data: {
        aiRecommendation: recommendation.trim(),
      },
    });

    return updated;
  }
}
