import { GoogleGenAI } from "@google/genai";
import { ECO_CHEMIST_SYSTEM_PROMPT } from "./system-prompt.ts";

// Using Vite's environment variable system for security
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";
const isMock = !apiKey;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const analyzeImageWithGemini = async (base64Image: string, language: 'en' | 'ar'): Promise<string> => {
  if (isMock || !ai) {
    return JSON.stringify({
      id: "PET",
      code: 1,
      confidence: 0.98,
      analysis: language === 'en'
        ? "Identified as Polyethylene Terephthalate (PET)."
        : "تم التعرف عليه على أنه بولي إيثيلين تيريفثاليت (PET).",
      detailed_explanation: language === 'en'
        ? "The material shows characteristics of PET plastic."
        : "تظهر المادة خصائص بلاستيك الـ PET المستخدم في العبوات."
    });
  }

  try {
    const prompt = language === 'en'
      ? `ACT AS A SENIOR CHEMICAL ENGINEER. 
         Analyze this image. FOCUS ONLY on materials, plastics, or chemical coatings. 
         IGNORE people, backgrounds, and context. 
         Return ONLY valid JSON: { "id": "PET|HDPE|PVC|LDPE|PP|PS|OTHER", "code": 1-7, "analysis": "Specific Material Name", "detailed_explanation": "Purely scientific/chemical reason for identification" }`
      : `تصرف كخبير كيمياء ومواد. قم بتحليل الصورة والتركيز حصراً على نوع المادة أو التغليف البلاستيكي الظاهر. الرد يجب أن يكون باللغة العربية العلمية فقط. أرجع فقط كائن JSON بالصيغة التالية: { "id": "PET|HDPE|PVC|LDPE|PP|PS|OTHER", "code": رقم من 1 إلى 7, "analysis": "اسم المادة بدقة", "detailed_explanation": "تفسير كيميائي وعلمي دقيق للمادة وخصائصها" }`;

    const data = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Using latest stable model version
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data } },
          { text: prompt }
        ]
      }
    });

    return response.text || '{}';
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const chatWithGreenTutor = async (history: { role: string, parts: { text: string }[] }[], message: string, language: 'en' | 'ar') => {
  if (isMock || !ai) return "Demo Mode: Configure API Key.";

  try {
    const systemInstruction = ECO_CHEMIST_SYSTEM_PROMPT;

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction },
      history: history.map(h => ({ role: h.role, parts: h.parts }))
    });

    const result = await chat.sendMessage({ message });
    return result.text ?? (language === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
  } catch (error) {
    return "Error connecting to AI.";
  }
};

export const getLewisStructure = async (molecule: string, language: 'en' | 'ar'): Promise<any> => {
  if (isMock || !ai) return null;
  try {
    const prompt = `Generate Lewis Structure for ${molecule}. Return JSON with "svg", "geometry", "hybridization", "angle", "details". Use ${language} for text.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text ?? 'null');
  } catch (e) { return null; }
}

export const smartSolveEquation = async (input: string, language: 'en' | 'ar'): Promise<string> => {
  if (isMock || !ai) return "";
  try {
    const prompt = `Balance this: ${input}. Return ONLY LaTeX string.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    });
    return (response.text ?? "").trim();
  } catch (e) { return ""; }
}