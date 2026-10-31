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

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return errorResponse(res, 'Vui lòng cung cấp địa chỉ email', 400);
      const result = await AuthService.forgotPassword(email);
      return successResponse(res, result, 'Đã gửi mã xác thực OTP về email');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi yêu cầu quên mật khẩu', 400);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return errorResponse(res, 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới', 400);
      }
      const result = await AuthService.resetPassword({ email, otp, newPassword });
      return successResponse(res, result, 'Đặt lại mật khẩu thành công');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi đặt lại mật khẩu', 400);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 400);
      }
      const result = await AuthService.changePassword(req.user!.userId, { currentPassword, newPassword });
      return successResponse(res, result, 'Đổi mật khẩu thành công');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi đổi mật khẩu', 400);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, avatar } = req.body;
      const result = await AuthService.updateProfile(req.user!.userId, { fullName, avatar });
      return successResponse(res, result, 'Cập nhật thông tin thành công');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Lỗi khi cập nhật thông tin', 400);
    }
  }

  static async logoutAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.logoutAllSessions(req.user!.userId);
      return successResponse(res, result, 'Đã đăng xuất khỏi tất cả các thiết bị khác');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
