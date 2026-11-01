import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';
import { SummaryType } from '@prisma/client';

export interface SummaryOutput {
  content: string;
  keyPoints: string[];
  importantTerms: { term: string; definition: string }[];
}

export class SummaryService {
  static async generateSummary(
    documentId: string,
    userId: string,
    type: SummaryType = SummaryType.DETAILED
  ): Promise<any> {
    // 1. Get document chunks
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
      take: 20, // Take representative chunks
    });

    if (chunks.length === 0) {
      throw new Error('Tài liệu chưa được xử lý nội dung hoặc không có văn bản.');
    }

    const documentText = chunks.map((c) => `[Trang ${c.pageNumber}]: ${c.content}`).join('\n\n');

    let promptGoal = '';
    switch (type) {
      case SummaryType.SHORT:
        promptGoal = 'Tạo một bản tóm tắt ngắn gọn trong 1-2 đoạn văn tập trung vào ý nghĩa cốt lõi của tài liệu.';
        break;
      case SummaryType.KEY_POINTS:
        promptGoal = 'Liệt kê các luận điểm chính, công thức hoặc quy tắc cốt lõi cần nhớ theo từng bullet point.';
        break;
      case SummaryType.IMPORTANT_TERMS:
        promptGoal = 'Trích xuất tất cả các thuật ngữ chuyên ngành quan trọng và định nghĩa chi tiết của chúng.';
        break;
      case SummaryType.EXAM_REVIEW:
        promptGoal = 'Tạo đề cương ôn tập trọng tâm phục vụ thi cử, kèm các bẫy thường gặp và câu hỏi tự kiểm tra.';
        break;
      case SummaryType.DETAILED:
      default:
        promptGoal = 'Tạo bản tóm tắt học thuật toàn diện, có cấu trúc mạch lạc, bao quát toàn bộ nội dung tài liệu.';
        break;
    }

    const prompt = `Dưới đây là nội dung trích xuất từ tài liệu học tập:
"""
${documentText}
"""

YÊU CẦU:
${promptGoal}

Hãy trả về kết quả dưới định dạng JSON chính xác theo cấu trúc sau:
{
  "content": "Nội dung tóm tắt chi tiết bằng định dạng Markdown...",
  "keyPoints": [
    "Điểm trọng tâm 1",
    "Điểm trọng tâm 2"
  ],
  "importantTerms": [
    { "term": "Tên thuật ngữ", "definition": "Định nghĩa giải thích" }
  ]
}`;

    const systemInstruction =
      'Bạn là chuyên gia sư phạm và tổng hợp kiến thức học thuật cao cấp của SmartDoc. Trả lời bằng tiếng Việt chuẩn xác. Tuyệt đối KHÔNG dùng ký tự thăng ### hoặc dấu sao ** trong nội dung.';
    const result = await GeminiService.generateJSON<SummaryOutput>(prompt, systemInstruction);

    const cleanContent = GeminiService.cleanMarkdownSymbols(result.content || '');
    const cleanKeyPoints = (result.keyPoints || []).map((pt) => GeminiService.cleanMarkdownSymbols(pt));

    // Save or update to database
    const summary = await prisma.summary.create({
      data: {
        documentId,
        userId,
        type,
        content: cleanContent,
        keyPoints: cleanKeyPoints,
        importantTerms: result.importantTerms || [],
      },
    });

    return summary;
  }
}
