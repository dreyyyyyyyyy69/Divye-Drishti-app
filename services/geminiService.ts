
import { GoogleGenAI } from "@google/genai";
import type { KundaliDetails, MahaKundaliDetails, Language } from '../types';

// Switching everything to Flash for APK stability and high rate limits
const PALMISTRY_MODEL = 'gemini-3-flash-preview';
const KUNDALI_MODEL = 'gemini-3-flash-preview';
const BNN_MODEL = 'gemini-3-flash-preview';
const SUMMARY_MODEL = 'gemini-3-flash-preview';
const CHAT_MODEL = 'gemini-3-flash-preview';
const MAHA_KUNDALI_MODEL = 'gemini-3-flash-preview';

const CURRENT_DATE_CONTEXT = "Current Date: February 7, 2026. Always treat the current year as 2026.";

export const getActiveApiKey = () => {
  const manualKey = localStorage.getItem('user_gemini_key');
  return manualKey || process.env.API_KEY || '';
};

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: getActiveApiKey() });
};

const getLanguageInstruction = (lang: Language) => {
  if (lang === 'english') {
    return "STRICT INSTRUCTION: Respond ONLY in plain, professional English. DO NOT use any Hinglish or Hindi words like 'Namaste', 'Beta', 'Ji', 'Shubh', 'Kundali', etc. Use purely English vocabulary.";
  }
  return "Respond in conversational Hinglish (Hindi written in Roman script). Keep it friendly and helpful like a personal astrologer friend.";
};

const handleApiError = (error: any) => {
  console.error("API Error:", error);
  if (error?.status === 429 || error?.message?.includes('429')) {
    return `⚠️ LIMIT REACHED! Aapki API Key ki limit khatam ho gayi hai. Settings mein check karein.`;
  }
  return "Ek error aa gaya hai. Kripya check karein ki aapka API key sahi hai aur internet chal raha hai.";
};

export const generateDailyPrediction = async (lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nProvide a detailed daily horoscope (Rashifal) for all zodiac signs today. Include 'What to do today' and 'What to expect today'. Use Markdown.`;
    const response = await ai.models.generateContent({ model: KUNDALI_MODEL, contents: prompt });
    return response.text ?? "Unable to fetch prediction.";
  } catch (e) { return "Daily prediction limit reached. Try again later."; }
};

export const analyzePalm = async (imageBase64: string, mimeType: string, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const contents = {
      parts: [
        { inlineData: { data: imageBase64, mimeType: mimeType } },
        { text: `${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nAnalyze this palm image. Provide reading. Use Markdown.` }
      ]
    };
    const response = await ai.models.generateContent({ model: PALMISTRY_MODEL, contents });
    return response.text ?? "No response.";
  } catch (error) { return handleApiError(error); }
};

export const generateKundali = async (details: KundaliDetails, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nDetailed Kundali analysis for ${details.name}, born ${details.dob} at ${details.tob} in ${details.pob}. Use Markdown.`;
    const response = await ai.models.generateContent({ model: KUNDALI_MODEL, contents: prompt });
    return response.text ?? "No response.";
  } catch (error) { return handleApiError(error); }
};

export const generateBnnAnalysis = async (details: KundaliDetails, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nBNN Career analysis for ${details.name}. Use Markdown.`;
    const response = await ai.models.generateContent({ model: BNN_MODEL, contents: prompt });
    return response.text ?? "No response.";
  } catch (error) { return handleApiError(error); }
};

export const generateMahaKundali = async (details: MahaKundaliDetails, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nProvide a deep Maha Kundali analysis for ${details.name}. Gender: ${details.gender}, Born: ${details.dob} ${details.tob} in ${details.pob}. Use Markdown.`;
    const response = await ai.models.generateContent({ model: MAHA_KUNDALI_MODEL, contents: prompt });
    return response.text ?? "Failed.";
  } catch (error) { return handleApiError(error); }
};

export const summarizeText = async (textToSummarize: string, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: SUMMARY_MODEL,
      contents: `${getLanguageInstruction(lang)}\nSummarize this astrological report briefly:\n${textToSummarize}`
    });
    return response.text ?? "Summary failed.";
  } catch (error) { return handleApiError(error); }
};

export const chatWithAnalysis = async (analysisContext: string, question: string, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: `Context: ${analysisContext}\n\n${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nQuestion: ${question}`
    });
    return response.text ?? "No answer.";
  } catch (error) { return handleApiError(error); }
};

export const chatWithMahaKundali = async (kundaliContext: string, question: string, lang: Language): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MAHA_KUNDALI_MODEL,
      contents: `Context: ${kundaliContext}\n\n${CURRENT_DATE_CONTEXT}\n${getLanguageInstruction(lang)}\nQuestion: ${question}`
    });
    return response.text ?? "No answer.";
  } catch (error) { return handleApiError(error); }
};
