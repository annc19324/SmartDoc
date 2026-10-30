import { prisma } from '../config/prisma.js';
import { RAGService } from './ai/rag.service.js';

export class ChatService {
  static async createSession(userId: string, title?: string, documentId?: string) {
    let sessionTitle = title;
    if (!sessionTitle) {
      if (documentId) {
        const doc = await prisma.document.findUnique({ where: { id: documentId } });
        sessionTitle = doc ? `Hỏi đáp về: ${doc.title}` : 'Phiên trò chuyện mới';
      } else {
        sessionTitle = 'Trò chuyện tài liệu học tập';
      }
    }

    const session = await prisma.chatSession.create({
      data: {
        userId,
        documentId: documentId || null,
        title: sessionTitle,
      },
      include: {
        document: { select: { id: true, title: true } },
      },
    });

    return session;
  }

  static async listSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        document: { select: { id: true, title: true } },
        _count: { select: { messages: true } },
      },
    });
  }

  static async getSessionWithMessages(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        document: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) throw new Error('Không tìm thấy phiên trò chuyện.');
    return session;
  }

  static async sendMessage(sessionId: string, userId: string, question: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
    });

    if (!session) throw new Error('Không tìm thấy phiên trò chuyện.');

    // 1. Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: question,
      },
    });

    // 2. Format history for RAG context
    const history = session.messages.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Execute RAG pipeline
    const ragResult = await RAGService.askQuestion(question, session.documentId || undefined, history);

    // 4. Save assistant response with sources
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: ragResult.answer,
        sources: ragResult.sources as any,
      },
    });

    // 5. Update session updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
      sources: ragResult.sources,
    };
  }

  static async deleteSession(sessionId: string, userId: string) {
    await prisma.chatSession.deleteMany({
      where: { id: sessionId, userId },
    });
    return true;
  }
}
