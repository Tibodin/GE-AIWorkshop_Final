import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API
// The API key should be set in your environment variables as GEMINI_API_KEY
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getGeminiResponse = async (prompt: string) => {
  try {
    const model = "gemini-3-flash-preview";
    
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful medical assistant for NeuroScan, an MRI analysis platform. Answer questions about brain health, MRI scans, and general medical inquiries. Always advise users to consult with a real doctor for professional diagnosis.",
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error: Could not connect to the AI assistant. Please check your API key configuration.";
  }
};
