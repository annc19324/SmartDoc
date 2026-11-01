import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadDocumentMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', DocumentController.list);
router.get('/smart-search', DocumentController.smartSearch);
router.get('/:id', DocumentController.getById);
router.get('/:id/download', DocumentController.download);
router.post('/upload', authenticate, uploadDocumentMiddleware.single('file'), DocumentController.upload);
router.delete('/:id', authenticate, DocumentController.delete);

export default router;
