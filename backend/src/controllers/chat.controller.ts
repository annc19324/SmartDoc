import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service.js';
import { successResponse, errorResponse } from '../utils/api-response.js';

export class ChatController {
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, documentId } = req.body;
      const session = await ChatService.createSession(req.user!.userId, title, documentId);
      return successResponse(res, session, 'Tạo phiên trò chuyện mới thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await ChatService.listSessions(req.user!.userId);
      return successResponse(res, sessions, 'Danh sách phiên trò chuyện');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const session = await ChatService.getSessionWithMessages(id, req.user!.userId);
      return successResponse(res, session, 'Chi tiết phiên trò chuyện');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { question } = req.body;
      if (!question || typeof question !== 'string') {
        return errorResponse(res, 'Nội dung câu hỏi không được để trống', 400);
      }

      const result = await ChatService.sendMessage(id, req.user!.userId, question);
      return successResponse(res, result, 'Trả lời từ SmartDoc RAG AI');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await ChatService.deleteSession(id, req.user!.userId);
      return successResponse(res, null, 'Đã xóa phiên trò chuyện');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
