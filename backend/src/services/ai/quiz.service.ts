import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';
import { QuizDifficulty } from '@prisma/client';

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
}

export class QuizService {
  static async generateQuiz(options: {
    documentId: string;
    userId: string;
    courseId?: string;
    title?: string;
    difficulty?: QuizDifficulty;
    questionCount?: number;
    chapter?: string;
  }) {
    const {
      documentId,
      userId,
      courseId,
      title = 'Bài kiểm tra trắc nghiệm AI',
      difficulty = QuizDifficulty.MEDIUM,
      questionCount = 5,
      chapter,
    } = options;

    // Fetch chunks
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
      take: 15,
    });

    if (chunks.length === 0) {
      throw new Error('Tài liệu chưa có nội dung văn bản để tạo câu hỏi trắc nghiệm.');
    }

    const documentText = chunks.map((c) => `[Trang ${c.pageNumber}]: ${c.content}`).join('\n\n');

    const prompt = `Dưới đây là tài liệu học tập:
"""
${documentText}
"""

YÊU CẦU TẠO QUIZ:
- Số lượng câu hỏi: ${questionCount} câu.
- Mức độ khó: ${difficulty} (EASY: nhận biết; MEDIUM: thông hiểu, vận dụng; HARD: phân tích sâu, bẫy tư duy).
${chapter ? `- Trọng tâm chương: ${chapter}` : ''}
- Mỗi câu hỏi phải có ĐÚNG 4 lựa chọn (options).
- Chỉ có 1 đáp án đúng (correctAnswer là index từ 0 đến 3).
- Cung cấp lời giải thích cặn kẽ (explanation) tại sao đáp án đó đúng, trích dẫn số trang nếu có.

Định dạng JSON trả về:
{
  "title": "${title}",
  "description": "Bài kiểm tra trắc nghiệm mức độ ${difficulty}",
  "questions": [
    {
      "question": "Nội dung câu hỏi trắc nghiệm?",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctAnswer": 0,
      "explanation": "Giải thích chi tiết tại sao A đúng..."
    }
  ]
}`;

    const systemInstruction = 'Bạn là giáo viên ra đề thi trắc nghiệm học thuật chuẩn quốc tế. Tuyệt đối không tạo câu hỏi mơ hồ. Luôn xuất ra JSON hợp lệ.';

    const generated = await GeminiService.generateJSON<{
      title: string;
      description: string;
      questions: GeneratedQuestion[];
    }>(prompt, systemInstruction);

    // Save quiz in database
    const quiz = await prisma.quiz.create({
      data: {
        title: generated.title || title,
        description: generated.description || `Độ khó: ${difficulty}`,
        difficulty,
        documentId,
        courseId,
        createdById: userId,
        questions: {
          create: generated.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return quiz;
  }

  static async submitQuizAttempt(
    quizId: string,
    userId: string,
    userAnswers: Record<string, number> // questionId -> selectedIndex
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) throw new Error('Không tìm thấy bài Quiz.');

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected !== undefined && selected === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 10).toFixed(1)) : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        answers: userAnswers,
      },
    });

    // Update learning analytics for the student
    const analytics = await prisma.learningAnalytics.findUnique({ where: { userId } });
    if (analytics) {
      const newQuizzesTaken = analytics.quizzesTaken + 1;
      const newAvg = (analytics.averageQuizScore * analytics.quizzesTaken + score) / newQuizzesTaken;
      await prisma.learningAnalytics.update({
        where: { userId },
        data: {
          quizzesTaken: newQuizzesTaken,
          averageQuizScore: parseFloat(newAvg.toFixed(1)),
        },
      });
    }

    return {
      attempt,
      score,
      correctCount,
      totalQuestions,
      questionsWithAnswers: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[q.id],
        isCorrect: userAnswers[q.id] === q.correctAnswer,
        explanation: q.explanation,
      })),
    };
  }
}
