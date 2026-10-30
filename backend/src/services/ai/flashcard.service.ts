import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';

export interface GeneratedCard {
  front: string;
  back: string;
}

export class FlashcardService {
  static async generateFlashcards(options: {
    documentId: string;
    userId: string;
    title?: string;
    cardCount?: number;
  }) {
    const { documentId, userId, title, cardCount = 8 } = options;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          take: 12,
        },
      },
    });

    if (!document || document.chunks.length === 0) {
      throw new Error('Tài liệu chưa có nội dung văn bản để tạo Flashcard.');
    }

    const docContent = document.chunks.map((c) => c.content).join('\n\n');

    const prompt = `Dưới đây là tài liệu:
"""
${docContent}
"""

YÊU CẦU:
Tạo ${cardCount} thẻ học Flashcard thông minh:
- Mặt trước (Front): Câu hỏi trọng tâm, khái niệm cần định nghĩa, hoặc bài toán ngắn gọn.
- Mặt sau (Back): Lời giải thích, định nghĩa súc tích, dễ nhớ, có ví dụ minh họa hoặc mẹo ghi nhớ.

Định dạng JSON:
{
  "title": "${title || `Thẻ ghi nhớ: ${document.title}`}",
  "description": "Bộ thẻ flashcard AI tạo từ tài liệu",
  "cards": [
    {
      "front": "Mặt trước của thẻ",
      "back": "Mặt sau của thẻ"
    }
  ]
}`;

    const systemInstruction = 'Bạn là chuyên gia ghi nhớ ngắt quãng (Spaced Repetition) và phương pháp học tích cực Flashcards. Xuất JSON hợp lệ.';

    const result = await GeminiService.generateJSON<{
      title: string;
      description: string;
      cards: GeneratedCard[];
    }>(prompt, systemInstruction);

    // Save Deck and Cards
    const deck = await prisma.flashcardDeck.create({
      data: {
        title: result.title || `Flashcard: ${document.title}`,
        description: result.description || 'Bộ thẻ ghi nhớ thông minh',
        documentId,
        userId,
        cards: {
          create: result.cards.map((c, idx) => ({
            front: c.front,
            back: c.back,
            order: idx + 1,
          })),
        },
      },
      include: {
        cards: true,
      },
    });

    return deck;
  }
}
