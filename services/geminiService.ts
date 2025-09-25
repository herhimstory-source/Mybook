import { GoogleGenAI } from "@google/genai";

// For deployment, this API key should be set as an environment variable (e.g., in Vercel).
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key is not set. AI features will be disabled. Please set the API_KEY environment variable.");
}

// Conditionally initialize the client.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateReview = async (title: string, author: string): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않아 AI 요약을 생성할 수 없습니다.";
  }
  
  try {
    const prompt = `"${title}" (저자: ${author})라는 책에 대한 한 단락 분량의 짧고 깊이 있는 서평을 한국어로 작성해주세요.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating review with Gemini API:", error);
    return "AI 서평을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
