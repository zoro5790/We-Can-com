import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Quiz } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelFlash = 'gemini-3-flash-preview';

export const GeminiService = {
  /**
   * Explains a lesson based on text content or an uploaded file (PDF/Image).
   */
  explainLesson: async (prompt: string, level: string, file?: { data: string, mimeType: string }): Promise<string> => {
    try {
      const parts: any[] = [];

      // Add file part if exists
      if (file) {
        parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      }

      // Add text prompt
      parts.push({
        text: `You are an expert tutor for Sudanese students in grade ${level}. 
        
        Task: Analyze the provided content (text or file) and explain the specific topic requested below.
        If a file is provided, look for the specific page number or lesson topic mentioned.
        
        Student Request (Page No / Topic): ${prompt}
        
        Output Requirements:
        1. Explain clearly in simple Arabic.
        2. Use bullet points for key concepts.
        3. Highlight important definitions.
        `
      });

      const response = await ai.models.generateContent({
        model: modelFlash,
        contents: [{ role: 'user', parts: parts }],
      });
      return response.text || "عذرًا، لم أتمكن من شرح هذا الدرس.";
    } catch (error) {
      console.error("Explanation error:", error);
      return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. قد يكون حجم الملف كبيراً جداً.";
    }
  },

  /**
   * Generates a quiz based on text content.
   */
  generateQuiz: async (content: string): Promise<Quiz | null> => {
    try {
      const response = await ai.models.generateContent({
        model: modelFlash,
        contents: `Generate a multiple-choice quiz (5 questions) in Arabic based on the following text. 
        Return ONLY JSON.
        Text: ${content}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" }
                  }
                }
              }
            }
          } as Schema
        }
      });
      
      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as Quiz;
    } catch (error) {
      console.error("Quiz generation error:", error);
      return null;
    }
  },

  /**
   * Chat with AI Assistant.
   */
  chatWithAssistant: async (history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string> => {
    try {
        // Construct the contents array ensuring strictly alternating roles if needed, 
        // though Gemini 1.5+ is flexible, correct structure helps.
        // System instruction goes into config, not contents.
        
        const contents = [
            ...history.map(h => ({ 
                role: h.role === 'model' ? 'model' : 'user', 
                parts: h.parts 
            })),
            { role: 'user', parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: modelFlash,
            contents: contents,
            config: {
                systemInstruction: "أنت مساعد تعليمي ذكي لمنصة 'We Can'. اسمك 'مساعد We Can'. تحدث باللغة العربية بأسلوب مشجع ومفيد للطلاب. ساعدهم في فهم دروسهم والإجابة على أسئلتهم الدراسية.",
            }
        });
        return response.text || "لا أستطيع الرد حالياً.";
    } catch (error) {
        console.error("Chat error", error);
        return "حدث خطأ في الشبكة، يرجى المحاولة لاحقاً.";
    }
  }
};