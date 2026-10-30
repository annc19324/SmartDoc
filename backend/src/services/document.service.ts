import { prisma } from '../config/prisma.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { DocumentProcessorService } from './document-processor.service.js';
import { RAGService } from './ai/rag.service.js';
import { DocumentStatus } from '@prisma/client';

export class DocumentService {
  /**
   * Upload Document and trigger background pipeline
   */
  static async uploadDocument(options: {
    title: string;
    description?: string;
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    fileSize: number;
    courseId?: string;
    categoryId?: string;
    userId: string;
  }) {
    const { title, description, fileBuffer, fileName, mimeType, fileSize, courseId, categoryId, userId } = options;

    // 1. Upload to Cloudinary (raw or image)
    const resourceType = mimeType.includes('pdf') || mimeType.includes('doc') ? 'raw' : 'auto';
    const cloudinaryResult = await uploadToCloudinary(fileBuffer, 'smartdoc/documents', resourceType, fileName);

    // 2. Create document in DB with UPLOADING status
    const document = await prisma.document.create({
      data: {
        title,
        description,
        fileUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        fileType: mimeType,
        fileSize,
        courseId: courseId || null,
        categoryId: categoryId || null,
        uploadedById: userId,
        status: DocumentStatus.UPLOADING,
      },
    });

    // 3. Trigger document processing pipeline asynchronously
    setImmediate(async () => {
      try {
        await DocumentProcessorService.processDocument(document.id, fileBuffer, mimeType);
      } catch (err) {
        console.error(`Async pipeline error on document ${document.id}:`, err);
      }
    });

    return document;
  }

  /**
   * Get all documents with search, category & course filter, and pagination
   */
  static async listDocuments(params: {
    search?: string;
    categoryId?: string;
    courseId?: string;
    status?: DocumentStatus;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, courseId, status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (courseId) where.courseId = courseId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          course: { select: { id: true, title: true, code: true } },
          uploadedBy: { select: { id: true, fullName: true, avatar: true } },
          _count: { select: { chunks: true, comments: true, ratings: true } },
        },
      }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get document by ID and increment view count
   */
  static async getDocumentById(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        course: true,
        uploadedBy: { select: { id: true, fullName: true, avatar: true, email: true } },
        _count: {
          select: {
            chunks: true,
            summaries: true,
            quizzes: true,
            flashcardDecks: true,
            mindmaps: true,
          },
        },
      },
    });

    if (!document) throw new Error('Không tìm thấy tài liệu.');

    // Increment view count
    await prisma.document.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return document;
  }

  /**
   * Smart Semantic Search across all documents via pgvector embedding
   */
  static async smartSearch(query: string, limit: number = 6) {
    const similarChunks = await RAGService.searchSimilarChunks(query, {
      topK: limit,
      similarityThreshold: 0.25,
    });

    // Group chunks by document
    const documentIds = Array.from(new Set(similarChunks.map((c) => c.documentId)));

    const docs = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      include: {
        category: true,
        course: true,
        uploadedBy: { select: { id: true, fullName: true } },
      },
    });

    // Combine document data with matching chunks and similarity score
    const results = docs.map((doc) => {
      const matchingChunks = similarChunks.filter((c) => c.documentId === doc.id);
      const topSimilarity = Math.max(...matchingChunks.map((c) => c.similarity));
      return {
        ...doc,
        topSimilarity: parseFloat(topSimilarity.toFixed(3)),
        matchedSnippets: matchingChunks.map((c) => ({
          pageNumber: c.pageNumber,
          snippet: c.content,
          similarity: parseFloat(c.similarity.toFixed(3)),
        })),
      };
    });

    return results.sort((a, b) => b.topSimilarity - a.topSimilarity);
  }

  /**
   * Delete Document
   */
  static async deleteDocument(id: string, userId: string, userRole: string) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw new Error('Tài liệu không tồn tại.');

    if (userRole !== 'ADMIN' && document.uploadedById !== userId) {
      throw new Error('Bạn không có quyền xóa tài liệu này.');
    }

    if (document.publicId) {
      await deleteFromCloudinary(document.publicId, document.fileType.includes('image') ? 'image' : 'raw');
    }

    await prisma.document.delete({ where: { id } });
    return true;
  }
}
