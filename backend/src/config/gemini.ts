import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

let genAI: GoogleGenerativeAI | null = null;

export const isGeminiConfigured = (): boolean => {
  return Boolean(
    env.GEMINI_API_KEY &&
      env.GEMINI_API_KEY.trim() !== '' &&
      env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );
};

export const getGeminiModel = (modelName: string = 'gemini-3.5-flash-lite') => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const getEmbeddingModel = (modelName: string = 'gemini-embedding-001') => {
  if (!isGeminiConfigured()) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export { genAI };

