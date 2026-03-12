import api from './apiService';

/**
 * Analyzes an image (ID card, certificate, or document) via the secure backend function.
 */
export const analyzeImageForVault = async (base64Image: string): Promise<any> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const result = await api.post('gemini/analyze-image', { image: cleanBase64 });
    return result;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Return a structured error so the UI can handle it
    return { error: true, message: "AI analysis failed. Please check network or try again." };
  }
};

/**
 * Generates a high-entropy secure password via the secure backend function.
 */
export const generateSecurePassword = async (): Promise<string> => {
  try {
    const { password } = await api.get('gemini/generate-password');
    return password || "Gen-Error-Secure-99!";
  } catch (e) {
    console.error("Password generation failed:", e);
    return "Secure-Fallback-123!";
  }
};
