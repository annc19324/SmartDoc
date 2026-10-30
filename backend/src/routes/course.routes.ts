import { Router } from 'express';
import { CourseController, CategoryController, NotificationController } from '../controllers/system.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '@prisma/client';

export const courseRouter = Router();
courseRouter.get('/', CourseController.list);
courseRouter.get('/:id', CourseController.getById);
courseRouter.post('/', authenticate, requireRole([Role.TEACHER, Role.ADMIN]), CourseController.create);

export const categoryRouter = Router();
categoryRouter.get('/', CategoryController.list);
categoryRouter.post('/', authenticate, requireRole([Role.ADMIN]), CategoryController.create);

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get('/', NotificationController.list);
notificationRouter.patch('/:id/read', NotificationController.markAsRead);
notificationRouter.patch('/read-all', NotificationController.markAllAsRead);
