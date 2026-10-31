import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import { successResponse, errorResponse } from '../utils/api-response.js';

export class DocumentController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Vui lòng chọn một file tài liệu (PDF, Word, TXT, Image)', 400);
      }

      const { title, description, courseId, categoryId } = req.body;
      if (!title) {
        return errorResponse(res, 'Tiêu đề tài liệu không được để trống', 400);
      }

      const document = await DocumentService.uploadDocument({
        title,
        description,
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        courseId,
        categoryId,
        userId: req.user!.userId,
      });

      return successResponse(
        res,
        document,
        'Tải lên tài liệu thành công. Hệ thống đang tiến hành phân tích văn bản & AI indexing.',
        201
      );
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi upload tài liệu', 500);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, courseId, status, page, limit } = req.query;
      const result = await DocumentService.listDocuments({
        search: search as string,
        categoryId: categoryId as string,
        courseId: courseId as string,
        status: status as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
      });
      return successResponse(res, result.documents, 'Lấy danh sách tài liệu thành công', 200, result.pagination);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const document = await DocumentService.getDocumentById(id);
      return successResponse(res, document, 'Chi tiết tài liệu');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async smartSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;
      if (!q || typeof q !== 'string') {
        return errorResponse(res, 'Vui lòng nhập từ khóa tìm kiếm ngữ nghĩa', 400);
      }
      const results = await DocumentService.smartSearch(q, limit ? parseInt(limit as string, 10) : 8);
      return successResponse(res, results, 'Kết quả tìm kiếm ngữ nghĩa (Semantic Vector Search)');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await DocumentService.deleteDocument(id, req.user!.userId, req.user!.role);
      return successResponse(res, null, 'Xóa tài liệu thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
