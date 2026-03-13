/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real application, the API key should be securely managed.
// For this demo, we'll use an environment variable or a placeholder.
const getAiClient = () => {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key is missing. Document analysis will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDocument = async (
  base64Data: string,
  mimeType: string,
  recordType: string,
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "Analysis unavailable: API key missing.";
  }

  try {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64String = base64Data.split(",")[1] || base64Data;

    const prompt = `Analyze this medical ${recordType.replace("_", " ")}. 
    Please extract the key information, summarize the findings, and present it in a clear, structured format. 
    Include patient name, date, doctor name, and main conclusions if visible. 
    Format the output using Markdown with clear headings and bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64String,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Error analyzing document:", error);
    return "Failed to analyze document. Please try again.";
  }
};
