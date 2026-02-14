
import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysis } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeImage = async (base64Image: string): Promise<AiAnalysis> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Analyze this image and provide a structured JSON response. Include a short descriptive title, a poetic description, a list of 5 tags, and a broad category (e.g., Nature, People, Architecture, Tech)." }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "tags", "category"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AiAnalysis;
};

export const editImageWithAi = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
