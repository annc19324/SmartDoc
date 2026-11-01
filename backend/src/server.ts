import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import chatRoutes from './routes/chat.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { courseRouter, categoryRouter, notificationRouter } from './routes/course.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Security & Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      const allowed = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
      if (
        allowed.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.endsWith('.onrender.com') ||
        requestOrigin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SmartDoc Backend API',
    version: '1.0.0',
    env: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/courses', courseRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(env.PORT, () => {
  console.log(`
======================================================
🚀 SmartDoc API Server running on port ${env.PORT}
📡 Environment: ${env.NODE_ENV}
🌐 Client URL: ${env.CLIENT_URL}
📚 RAG & AI Pipeline: Ready
======================================================
  `);
});

export { app, server };
