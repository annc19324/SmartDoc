import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { prisma } from '../config/prisma.js';
import { EmbeddingService } from './ai/embedding.service.js';
import { DocumentStatus } from '@prisma/client';
import crypto from 'crypto';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface TextChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  metadata?: Record<string, any>;
}

export class DocumentProcessorService {
  /**
   * Process a document through the full pipeline:
   * Text Extraction -> Chunking -> Embedding Generation -> Vector DB Storage
   */
  static async processDocument(documentId: string, fileBuffer: Buffer, fileType: string): Promise<void> {
    try {
      // 1. Mark status as PROCESSING
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING, errorMessage: null },
      });

      // 2. Extract text with page numbers
      const pages = await this.extractTextPages(fileBuffer, fileType);
      const totalPages = pages.length;

      // Update page count
      await prisma.document.update({
        where: { id: documentId },
        data: { pageCount: totalPages },
      });

      // 3. Chunk the text while preserving page number
      const chunks = this.createChunks(pages, 800, 150);

      if (chunks.length === 0) {
        throw new Error('No readable text could be extracted from this document.');
      }

      // 4. Clean old chunks if any
      await prisma.documentChunk.deleteMany({
        where: { documentId },
      });

      // 5. Generate embeddings and save to pgvector database
      for (const chunk of chunks) {
        const embedding = await EmbeddingService.generateEmbedding(chunk.content);
        const chunkId = crypto.randomUUID();
        const vectorString = `[${embedding.join(',')}]`;
        const metadataJson = JSON.stringify(chunk.metadata || {});

        // Use raw query to insert pgvector
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "document_chunks" ("id", "documentId", "content", "pageNumber", "chunkIndex", "embedding", "metadata", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6::vector, $7::jsonb, NOW())`,
            chunkId,
            documentId,
            chunk.content,
            chunk.pageNumber,
            chunk.chunkIndex,
            vectorString,
            metadataJson
          );
        } catch (dbErr: any) {
          // If pgvector extension is not yet installed, fallback to saving without vector type
          console.warn('pgvector direct insert fallback (checking vector extension):', dbErr.message);
          await prisma.$executeRawUnsafe(
            `INSERT INTO "document_chunks" ("id", "documentId", "content", "pageNumber", "chunkIndex", "metadata", "createdAt")
             VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())`,
            chunkId,
            documentId,
            chunk.content,
            chunk.pageNumber,
            chunk.chunkIndex,
            metadataJson
          );
        }
      }

      // 6. Mark document as READY
      await prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.READY },
      });

      console.log(`✅ Document ${documentId} processed successfully: ${totalPages} pages, ${chunks.length} chunks.`);
    } catch (error: any) {
      console.error(`❌ Document processing failed for ${documentId}:`, error);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
          errorMessage: error.message || 'Unknown processing error',
        },
      });
      throw error;
    }
  }

  /**
   * Extract pages from different file formats
   */
  static async extractTextPages(fileBuffer: Buffer, fileType: string): Promise<ExtractedPage[]> {
    const pages: ExtractedPage[] = [];

    if (fileType.includes('pdf')) {
      // Custom page renderer with pdf-parse
      let currentPage = 1;
      const pageTexts: { [page: number]: string } = {};

      const renderPage = (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let text = '';
          for (const item of textContent.items) {
            text += item.str + ' ';
          }
          pageTexts[currentPage] = text.trim();
          currentPage++;
          return text;
        });
      };

      const parsed = await pdfParse(fileBuffer, { pagerender: renderPage });

      if (Object.keys(pageTexts).length > 0) {
        for (const [pageStr, text] of Object.entries(pageTexts)) {
          if (text && text.trim().length > 0) {
            pages.push({ pageNumber: parseInt(pageStr, 10), text });
          }
        }
      } else if (parsed.text) {
        // Fallback: split by form feed character (\f) which often separates PDF pages
        const rawPages = parsed.text.split('\f');
        rawPages.forEach((pText: string, idx: number) => {
          if (pText.trim()) {
            pages.push({ pageNumber: idx + 1, text: pText.trim() });
          }
        });
      }
    } else if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('officedocument')) {
      // DOCX via Mammoth - cleanly preserve natural paragraphs and line breaks
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const fullText = (result.value || '').trim();

      // Split into logical paragraphs while maintaining newlines
      const rawParas = fullText.split(/\r?\n+/).map((p) => p.trim()).filter((p) => p.length > 0);

      let pageNum = 1;
      let currentPageParas: string[] = [];
      let currentWordCount = 0;

      for (const para of rawParas) {
        const wordsInPara = para.split(/\s+/).length;
        if (currentWordCount + wordsInPara > 350 && currentPageParas.length > 0) {
          pages.push({ pageNumber: pageNum++, text: currentPageParas.join('\n\n') });
          currentPageParas = [para];
          currentWordCount = wordsInPara;
        } else {
          currentPageParas.push(para);
          currentWordCount += wordsInPara;
        }
      }
      if (currentPageParas.length > 0) {
        pages.push({ pageNumber: pageNum, text: currentPageParas.join('\n\n') });
      }
    } else {
      // Plain text or markdown
      const text = fileBuffer.toString('utf-8');
      pages.push({ pageNumber: 1, text: text.trim() });
    }

    // If completely empty, add at least one page
    if (pages.length === 0) {
      pages.push({ pageNumber: 1, text: 'No readable text content' });
    }

    return pages;
  }

  /**
   * Split pages into overlapping chunks while maintaining page number
   */
  static createChunks(pages: ExtractedPage[], chunkSize: number = 800, overlap: number = 150): TextChunk[] {
    const chunks: TextChunk[] = [];
    let globalIndex = 0;

    for (const page of pages) {
      const pageText = page.text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n');
      let start = 0;

      while (start < pageText.length) {
        const end = Math.min(start + chunkSize, pageText.length);
        const chunkText = pageText.substring(start, end).trim();

        if (chunkText.length > 50) {
          // Ignore trivial small fragments
          chunks.push({
            content: chunkText,
            pageNumber: page.pageNumber,
            chunkIndex: globalIndex++,
            metadata: {
              charLength: chunkText.length,
              sourcePage: page.pageNumber,
            },
          });
        }

        if (end >= pageText.length) break;
        start += chunkSize - overlap;
      }
    }

    return chunks;
  }
}
