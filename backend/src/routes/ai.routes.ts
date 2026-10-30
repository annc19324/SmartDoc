import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Summaries
router.post('/summary', AIController.generateSummary);
router.get('/summary/:documentId', AIController.getDocumentSummaries);

// Quizzes
router.post('/quiz/generate', AIController.generateQuiz);
router.get('/quizzes', AIController.listQuizzes);
router.get('/quizzes/:id', AIController.getQuizById);
router.post('/quizzes/:id/submit', AIController.submitQuiz);

// Mindmaps
router.post('/mindmap/generate', AIController.generateMindmap);
router.get('/mindmaps', AIController.listMindmaps);
router.get('/mindmaps/:id', AIController.getMindmapById);

// Flashcards
router.post('/flashcards/generate', AIController.generateFlashcards);
router.get('/flashcards/decks', AIController.listFlashcardDecks);
router.get('/flashcards/decks/:id', AIController.getFlashcardDeckById);

// Study Plan
router.post('/study-plan/generate', AIController.generateStudyPlan);
router.get('/study-plans', AIController.getStudyPlans);

// Analytics & Recommendation
router.get('/analytics', AIController.getAnalytics);
router.post('/analytics/recommendation/refresh', AIController.refreshRecommendation);

export default router;
