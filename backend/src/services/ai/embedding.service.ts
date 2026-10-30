import { getEmbeddingModel } from '../../config/gemini.js';

export class EmbeddingService {
  /**
   * Generates a 768-dimensional embedding vector for a given text using text-embedding-004
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = getEmbeddingModel();
      // Clean and normalize text
      const cleanText = text.replace(/\s+/g, ' ').trim().slice(0, 8000);
      const result = await model.embedContent(cleanText);
      return result.embedding.values;
    } catch (error: any) {
      console.error('Error generating embedding via Gemini API:', error.message);
      // Fallback deterministic dummy vector if API key is not yet set or in offline sandbox
      return this.generateSimulatedVector(text);
    }
  }

  /**
   * Batch generation of embeddings
   */
  static async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const emb = await this.generateEmbedding(text);
      embeddings.push(emb);
    }
    return embeddings;
  }

  /**
   * Deterministic simulated 768-dim normalized embedding for development/fallback
   */
  private static generateSimulatedVector(text: string): number[] {
    const vector = new Array(768).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < 768; i++) {
      const seed = Math.sin(hash + i) * 10000;
      vector[i] = seed - Math.floor(seed);
    }
    // Normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((v) => (norm > 0 ? v / norm : 0));
  }
}
