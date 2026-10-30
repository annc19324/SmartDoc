import { prisma } from '../../config/prisma.js';
import { GeminiService } from './gemini.service.js';

export interface MindmapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindmapNode[];
}

export class MindmapService {
  static async generateMindmap(documentId: string, userId: string, title?: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
          take: 15,
        },
      },
    });

    if (!document || document.chunks.length === 0) {
      throw new Error('Tài liệu chưa có đủ dữ liệu nội dung để tạo Mindmap.');
    }

    const docContent = document.chunks.map((c) => c.content).join('\n\n');

    const prompt = `Dưới đây là nội dung tài liệu học tập:
"""
${docContent}
"""

YÊU CẦU:
Hãy phân tích tài liệu và tạo một SƠ ĐỒ TƯ DUY (Mindmap) phân cấp khoa học và toàn diện.
Cấu trúc dạng cây (Tree):
- Gốc (Root): Chủ đề cốt lõi của tài liệu.
- Cấp 1 (Chương / Mảng kiến thức lớn).
- Cấp 2 (Khái niệm, Định lý, Phân loại).
- Cấp 3 (Chi tiết, ví dụ, ứng dụng).

Định dạng JSON yêu cầu:
{
  "title": "${title || document.title}",
  "treeData": {
    "id": "root",
    "label": "Tên chủ đề chính",
    "children": [
      {
        "id": "node-1",
        "label": "Nhánh chính 1",
        "children": [
          {
            "id": "node-1-1",
            "label": "Tiểu mục 1.1",
            "children": []
          }
        ]
      }
    ]
  }
}`;

    const systemInstruction = 'Bạn là chuyên gia kiến trúc tri thức và sơ đồ tư duy. Hãy phân cấp logic rõ ràng, nhãn (label) súc tích, mang tính gợi nhớ cao. Xuất JSON hợp lệ.';

    const result = await GeminiService.generateJSON<{
      title: string;
      treeData: MindmapNode;
    }>(prompt, systemInstruction);

    // Save to database
    const mindmap = await prisma.mindmap.create({
      data: {
        title: result.title || document.title,
        documentId,
        userId,
        treeData: result.treeData as any,
      },
    });

    return mindmap;
  }
}
