import { getGeminiModel } from '../../config/gemini.js';

export class GeminiService {
  /**
   * Generates text response from Gemini
   */
  static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const model = getGeminiModel('gemini-1.5-flash');
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error generating text with Gemini:', error.message);
      throw error;
    }
  }

  /**
   * Generates structured JSON from Gemini
   */
  static async generateJSON<T = any>(prompt: string, systemInstruction?: string): Promise<T> {
    try {
      const jsonSystemInstruction = `${systemInstruction || ''}\nIMPORTANT: You must respond ONLY with valid JSON. Do not include markdown code blocks like \`\`\`json or \`\`\`. Output raw parseable JSON only.`;
      const rawText = await this.generateText(prompt, jsonSystemInstruction);

      // Clean up in case Gemini still wrapped in code fences
      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error: any) {
      console.error('Failed to parse Gemini JSON response:', error.message);
      throw error;
    }
  }
}
