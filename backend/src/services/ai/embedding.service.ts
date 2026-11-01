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
      const raw = result.embedding.values;
      const sliced = raw.length >= 768 ? raw.slice(0, 768) : raw.concat(new Array(768 - raw.length).fill(0));
      const norm = Math.sqrt(sliced.reduce((sum, val) => sum + val * val, 0));
      return sliced.map((v) => (norm > 0 ? v / norm : 0));
    } catch (error: any) {
      console.warn('Embedding API fallback to deterministic vector:', error.message);
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
