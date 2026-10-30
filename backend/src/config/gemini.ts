import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
} else {
  console.warn('⚠️ GEMINI_API_KEY is not defined in environment. AI features will require the API key.');
}

export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  if (!genAI) {
    if (env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } else {
      throw new Error('GEMINI_API_KEY is missing. Please set it in your .env file to use AI features.');
    }
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const getEmbeddingModel = (modelName: string = 'text-embedding-004') => {
  if (!genAI) {
    if (env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } else {
      throw new Error('GEMINI_API_KEY is missing. Please set it in your .env file to generate embeddings.');
    }
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export { genAI };
