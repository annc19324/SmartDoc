import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/api-response.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, role } = req.body;
      const result = await AuthService.register({ email, password, fullName, role });
      return successResponse(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi đăng ký', 400);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return successResponse(res, result, 'Đăng nhập thành công', 200);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi đăng nhập', 401);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return errorResponse(res, 'Refresh token is required', 400);
      const result = await AuthService.refresh(refreshToken);
      return successResponse(res, result, 'Cấp lại access token thành công');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Invalid refresh token', 401);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return successResponse(res, null, 'Đăng xuất thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return successResponse(res, user, 'Lấy thông tin người dùng thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }
}
