import { prisma } from '../../config/prisma.js';
import { EmbeddingService } from './embedding.service.js';
import { GeminiService } from './gemini.service.js';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  pageNumber: number;
  similarity: number;
}

export interface RAGSource {
  documentId: string;
  documentName: string;
  pageNumber: number;
  contentSnippet: string;
}

export interface RAGAnswerResult {
  answer: string;
  sources: RAGSource[];
}

export class RAGService {
  /**
   * Vector Search on Neon PostgreSQL + pgvector
   */
  static async searchSimilarChunks(
    query: string,
    options: {
      documentId?: string;
      topK?: number;
      similarityThreshold?: number;
    } = {}
  ): Promise<RetrievedChunk[]> {
    const { documentId, topK = 5, similarityThreshold = 0.3 } = options;

    const queryEmbedding = await EmbeddingService.generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    try {
      let results: any[];

      if (documentId) {
        results = await prisma.$queryRawUnsafe(
          `SELECT
             c."id",
             c."documentId",
             d."title" AS "documentTitle",
             c."content",
             c."pageNumber",
             1 - (c."embedding" <=> $1::vector) AS "similarity"
           FROM "document_chunks" c
           JOIN "documents" d ON c."documentId" = d."id"
           WHERE c."documentId" = $2
             AND c."embedding" IS NOT NULL
           ORDER BY "similarity" DESC
           LIMIT $3`,
          vectorString,
          documentId,
          topK
        );
      } else {
        results = await prisma.$queryRawUnsafe(
          `SELECT
             c."id",
             c."documentId",
             d."title" AS "documentTitle",
             c."content",
             c."pageNumber",
             1 - (c."embedding" <=> $1::vector) AS "similarity"
           FROM "document_chunks" c
           JOIN "documents" d ON c."documentId" = d."id"
           WHERE c."embedding" IS NOT NULL
           ORDER BY "similarity" DESC
           LIMIT $2`,
          vectorString,
          topK
        );
      }

      return results
        .filter((r) => r.similarity >= similarityThreshold)
        .map((r) => ({
          id: r.id,
          documentId: r.documentId,
          documentTitle: r.documentTitle,
          content: r.content,
          pageNumber: r.pageNumber,
          similarity: parseFloat(r.similarity),
        }));
    } catch (err: any) {
      console.warn('pgvector search fallback (text search):', err.message);
      // Fallback: ILIKE search when vector extension is not present in local db
      const fallbackChunks = await prisma.documentChunk.findMany({
        where: {
          ...(documentId && { documentId }),
          content: { contains: query.split(' ')[0] || '', mode: 'insensitive' },
        },
        include: { document: { select: { title: true } } },
        take: topK,
      });

      return fallbackChunks.map((c) => ({
        id: c.id,
        documentId: c.documentId,
        documentTitle: c.document.title,
        content: c.content,
        pageNumber: c.pageNumber,
        similarity: 0.85,
      }));
    }
  }

  /**
   * Complete RAG pipeline: Query -> Embedding -> Vector Search -> Context Assembly -> Gemini -> Answer + Sources
   */
  static async askQuestion(
    question: string,
    documentId?: string,
    chatHistory: { role: string; content: string }[] = []
  ): Promise<RAGAnswerResult> {
    // 1. Retrieve relevant chunks
    const chunks = await this.searchSimilarChunks(question, {
      documentId,
      topK: 4,
      similarityThreshold: 0.2,
    });

    if (chunks.length === 0) {
      // If no relevant documents found in RAG
      const generalAnswer = await GeminiService.generateText(
        `Người dùng hỏi: "${question}". Hiện tại không tìm thấy đoạn trích phù hợp trong tài liệu đã chọn. Hãy trả lời một cách lịch sự, giải thích ngắn gọn dựa trên kiến thức chung nhưng nhắc nhở người dùng tải lên hoặc chọn tài liệu liên quan. TUYỆT ĐỐI KHÔNG dùng ký tự thăng ### hoặc dấu sao **.`
      );
      return {
        answer: GeminiService.cleanMarkdownSymbols(generalAnswer),
        sources: [],
      };
    }

    // 2. Build Context with clear page markers
    const contextText = chunks
      .map(
        (c, idx) =>
          `[Đoạn ${idx + 1} | Tài liệu: "${c.documentTitle}" | Trang: ${c.pageNumber}]\n${c.content}`
      )
      .join('\n\n---\n\n');

    // 3. System instruction for strict grounded RAG
    const systemInstruction = `Bạn là Trợ lý AI Thông Minh SmartDoc - Nền tảng học tập & phân tích tài liệu học thuật.
Nhiệm vụ của bạn là trả lời câu hỏi của người học dựa CHỦ YẾU trên các đoạn ngữ cảnh (Context) được cung cấp dưới đây.

QUY TẮC BẮT BUỘC:
1. Luôn ưu tiên thông tin chính xác từ tài liệu được trích dẫn.
2. Khi đưa ra thông tin từ tài liệu, hãy chỉ rõ bạn lấy từ trang nào (ví dụ: "Theo Trang 12 của tài liệu...").
3. Trình bày câu trả lời rõ ràng, văn phong tự nhiên, dùng gạch đầu dòng (-) hoặc số thứ tự, TUYỆT ĐỐI KHÔNG dùng ký tự thăng ### hoặc dấu sao **.
4. Giữ giọng điệu học thuật, khích lệ, sư phạm, chuẩn xác.
5. Nếu trong ngữ cảnh không có thông tin để trả lời câu hỏi, hãy trung thực thông báo: "Tài liệu này không đề cập đến nội dung bạn vừa hỏi", sau đó có thể hỗ trợ tóm tắt kiến thức chung một cách ngắn gọn.`;

    const prompt = `Ngữ cảnh tài liệu:
"""
${contextText}
"""

Lịch sử trò chuyện gần nhất:
${chatHistory.map((m) => `${m.role === 'user' ? 'Người dùng' : 'SmartDoc AI'}: ${m.content}`).join('\n')}

Câu hỏi mới của người dùng:
"${question}"

Hãy trả lời câu hỏi trên dựa vào các đoạn tài liệu được cung cấp.`;

    // 4. Generate answer with Gemini
    const rawAnswer = await GeminiService.generateText(prompt, systemInstruction);
    const answer = GeminiService.cleanMarkdownSymbols(rawAnswer);

    // 5. Build clean Sources array
    const sources: RAGSource[] = chunks.map((c) => ({
      documentId: c.documentId,
      documentName: c.documentTitle,
      pageNumber: c.pageNumber,
      contentSnippet: c.content.length > 200 ? c.content.slice(0, 200) + '...' : c.content,
    }));

    return {
      answer,
      sources,
    };
  }
}
