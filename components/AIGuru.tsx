
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { ChatBot } from './common/ChatBot';
import { GoogleGenAI } from '@google/genai';
import { getActiveApiKey } from '../services/geminiService';
import type { Chat } from '@google/genai';

const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [mimeTypePart, base64Part] = result.split(',');
        const mimeType = mimeTypePart.split(':')[1].split(';')[0];
        resolve({ base64: base64Part, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
};

// Switched to Flash for better performance and reliability in APK
const AI_GURU_MODEL = 'gemini-3-flash-preview';

interface AIGuruProps {
    context: string;
}

export const AIGuru: React.FC<AIGuruProps> = ({ context }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatSession = useRef<Chat | null>(null);

    const initChat = () => {
        try {
            const key = getActiveApiKey();
            const ai = new GoogleGenAI({ apiKey: key });
            const systemInstruction = `You are 'AI Guru', a supremely knowledgeable sage. Your response MUST be a single, clean JSON object with "response" (string) and "confidence" (0-100). Use Hinglish.`;
            
            chatSession.current = ai.chats.create({
                model: AI_GURU_MODEL,
                config: { systemInstruction },
            });
        } catch (e) {
            console.error("Failed to init AI Guru:", e);
        }
    };

    useEffect(() => {
        initChat();
        setChatHistory([{ role: 'model', text: 'Main AI Guru hoon. Aapka swagat hai. Kuch bhi poochein.' }]);
    }, []);

    const handleSendMessage = async (message: string, file: File | null) => {
        if (!message.trim() && !file) return;

        setIsLoading(true);
        const userMessage: ChatMessage = { role: 'user', text: message };
        let parts: (string | { inlineData: { data: string, mimeType: string }})[] = [
            `Report Context:\n${context}\n\nQuestion:`,
        ];

        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                parts.push({ inlineData: { data: base64, mimeType: mimeType } });
                userMessage.image = URL.createObjectURL(file);
            } catch(e) {
                setChatHistory(prev => [...prev, {role: 'model', text: "Error in file upload."}]);
                setIsLoading(false);
                return;
            }
        }
        
        if (message.trim()) parts.push(message);
        setChatHistory(prev => [...prev, userMessage]);

        try {
            const key = getActiveApiKey();
            if (!chatSession.current) {
                initChat();
            }
            
            const response = await chatSession.current!.sendMessage({ message: parts });
            const responseText = response.text ?? "{}";

            try {
                const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanedJson);
                setChatHistory(prev => [...prev, { role: 'model', text: parsed.response || responseText, confidence: parsed.confidence }]);
            } catch(e) {
                setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
            }
        } catch (err: any) {
            console.error("Guru Error:", err);
            let errMsg = 'Baat-cheet mein kuch samasya aa gayi hai.';
            if (err?.status === 429 || err?.message?.includes('429')) {
                errMsg = "⚠️ LIMIT REACHED! Nayi API Key check karein.";
            }
            setChatHistory(prev => [...prev, { role: 'model', text: errMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChatBot
            history={chatHistory}
            onSend={handleSendMessage}
            isLoading={isLoading}
            title="AI Guru Support"
            placeholder="Kuch bhi poochein..."
        />
    );
};
