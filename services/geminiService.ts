import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini with the pre-configured env key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCharacter = async (prompt: string) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  const systemInstruction = `You are a master fantasy writer and world builder. 
  Create unique, deep, and interesting characters for a role-playing game or novel. 
  Return the result in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            traits: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["name", "role", "description", "traits"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generatePlace = async (prompt: string) => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Describe a fantasy location based on this idea: ${prompt}. Return a JSON with name, type, and description.`,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "type", "description"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
     console.error("Gemini Generation Error:", error);
     throw error;
  }
};
