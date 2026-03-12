import { GoogleGenAI } from "@google/genai";
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// FIX: Per coding guidelines, the API key must be read from the `API_KEY` environment variable.
const API_KEY = process.env.API_KEY!;
const ai = new GoogleGenAI({ apiKey: API_KEY });

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    const path = event.path.replace('/api/gemini', '');
    const method = event.httpMethod;
    
    if (method !== 'POST' && method !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        if (path === '/analyze-image' && method === 'POST') {
            const { image } = JSON.parse(event.body!);
            if (!image) return { statusCode: 400, body: JSON.stringify({ message: 'Image data is required' }) };

            const prompt = `
              Analyze this image of a document/ID. Extract all visible text fields into a JSON structure.
              Return ONLY the JSON object.
              Schema: {
                "title": "A clear title for the item",
                "fields": { "FullName": "...", "ID_Number": "...", "Expiry": "..." },
                "suggestedType": "ID_CARD" | "CERTIFICATE" | "PASSWORD"
              }`;
              
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: image } }, { text: prompt }] },
                config: { responseMimeType: "application/json" }
            });

            return { statusCode: 200, body: response.text };
        }

        if (path === '/generate-password' && method === 'GET') {
             const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: "Generate one extremely secure, high-entropy password (16-24 chars, mixed case, numbers, symbols). Return ONLY the password string."
            });
            const password = response.text?.trim() || "Gen-Error-Secure-99!";
            return { statusCode: 200, body: JSON.stringify({ password }) };
        }
        
        return { statusCode: 404, body: 'Not Found' };
    
    } catch (error: any) {
        console.error("Gemini Function Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};

export { handler };
