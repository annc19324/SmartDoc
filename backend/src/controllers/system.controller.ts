import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service.js';
import { CategoryService } from '../services/category.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AdminService } from '../services/admin.service.js';
import { successResponse, errorResponse } from '../utils/api-response.js';

export class CourseController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const courses = await CourseService.listCourses(search as string);
      return successResponse(res, courses);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const course = await CourseService.getCourseById(id);
      return successResponse(res, course);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, code, description, thumbnail, categoryId } = req.body;
      const course = await CourseService.createCourse({
        title,
        code,
        description,
        thumbnail,
        teacherId: req.user!.userId,
        categoryId,
      });
      return successResponse(res, course, 'Tạo khóa học thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export class CategoryController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.listCategories();
      return successResponse(res, categories);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, description } = req.body;
      const category = await CategoryService.createCategory({ name, slug, description });
      return successResponse(res, category, 'Tạo danh mục thành công', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user!.userId);
      return successResponse(res, notifications);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await NotificationService.markAsRead(id, req.user!.userId);
      return successResponse(res, null, 'Đã đánh dấu đã đọc');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.userId);
      return successResponse(res, null, 'Đã đánh dấu tất cả đã đọc');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export class AdminController {
  static async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardMetrics();
      return successResponse(res, data, 'Thống kê tổng quan hệ thống Admin');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, role } = req.query;
      const users = await AdminService.listUsers(search as string, role as any);
      return successResponse(res, users);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { isActive } = req.body;
      const updated = await AdminService.updateUserStatus(id, isActive);
      return successResponse(res, updated, 'Cập nhật trạng thái người dùng thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async changeUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { role } = req.body;
      const updated = await AdminService.updateUserRole(id, role);
      return successResponse(res, updated, 'Cập nhật phân quyền thành công');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}
