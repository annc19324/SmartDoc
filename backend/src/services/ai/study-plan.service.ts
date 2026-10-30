import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';

export interface PlanDay {
  day: number;
  date?: string;
  topic: string;
  tasks: string[];
  estimatedHours: number;
  completed: boolean;
}

export class StudyPlanService {
  static async generateStudyPlan(options: {
    userId: string;
    subject: string;
    examDate: string | Date;
    targetScore: string;
    availableHoursPerDay: number;
    currentLevel: string;
  }) {
    const { userId, subject, examDate, targetScore, availableHoursPerDay, currentLevel } = options;

    const targetDate = new Date(examDate);
    const now = new Date();
    const diffTime = Math.max(targetDate.getTime() - now.getTime(), 0);
    const daysUntilExam = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 3); // Minimum 3 days plan

    const prompt = `YÊU CẦU LẬP KẾ HOẠCH HỌC TẬP TỐI ƯU BẰNG AI:
- Môn học / Chủ đề: "${subject}"
- Số ngày còn lại trước kỳ thi: ${daysUntilExam} ngày (Ngày thi: ${targetDate.toISOString().split('T')[0]})
- Mục tiêu điểm số: "${targetScore}"
- Thời gian học mỗi ngày: ${availableHoursPerDay} giờ/ngày
- Trình độ hiện tại của sinh viên: "${currentLevel}"

Hãy xây dựng một lộ trình học tập khoa học chia theo từng ngày (từ Ngày 1 đến Ngày ${Math.min(daysUntilExam, 14)}), bao gồm:
1. Giai đoạn củng cố nền tảng
2. Giai đoạn luyện tập chuyên sâu & làm quiz
3. Giai đoạn tổng ôn, thi thử và khắc phục điểm yếu

Định dạng JSON yêu cầu:
{
  "subject": "${subject}",
  "planData": [
    {
      "day": 1,
      "topic": "Tên chủ đề học tập cho ngày 1",
      "tasks": [
        "Nhiệm vụ cụ thể 1",
        "Nhiệm vụ cụ thể 2",
        "Làm quiz 5 câu tự kiểm tra"
      ],
      "estimatedHours": ${availableHoursPerDay},
      "completed": false
    }
  ]
}`;

    const systemInstruction = 'Bạn là cố vấn học tập hàng đầu. Kế hoạch phải thực tế, có tính hành động cao, phân bổ khối lượng kiến thức đồng đều. Xuất JSON hợp lệ.';

    const result = await GeminiService.generateJSON<{
      subject: string;
      planData: PlanDay[];
    }>(prompt, systemInstruction);

    // Save to database
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        subject,
        examDate: targetDate,
        targetScore,
        availableHoursPerDay,
        currentLevel,
        planData: result.planData as any,
      },
    });

    return studyPlan;
  }
}
