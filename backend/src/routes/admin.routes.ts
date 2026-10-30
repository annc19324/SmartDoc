import { Router } from 'express';
import { AdminController } from '../controllers/system.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, requireRole([Role.ADMIN]));

router.get('/metrics', AdminController.getMetrics);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.patch('/users/:id/role', AdminController.changeUserRole);

export default router;
