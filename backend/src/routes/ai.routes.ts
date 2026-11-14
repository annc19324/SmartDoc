import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public read-only summaries on Document Detail page
router.get('/summary/:documentId', AIController.getDocumentSummaries);

router.use(authenticate);

// Summaries (Protected generation)
router.post('/summary', AIController.generateSummary);

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
router.get('/study-plans/:id', AIController.getStudyPlanById);

// Analytics & Recommendation
router.get('/analytics', AIController.getAnalytics);
router.post('/analytics/recommendation/refresh', AIController.refreshRecommendation);

export default router;
