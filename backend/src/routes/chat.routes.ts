import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/sessions', ChatController.createSession);
router.get('/sessions', ChatController.listSessions);
router.get('/sessions/:id', ChatController.getSession);
router.post('/sessions/:id/messages', ChatController.sendMessage);
router.delete('/sessions/:id', ChatController.deleteSession);

export default router;
