
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { ChatBot } from './common/ChatBot';
import { GoogleGenAI } from '@google/genai';
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

const AI_DOST_MODEL = 'gemini-3-pro-preview';

export const AIDost: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatSession = useRef<Chat | null>(null);

    useEffect(() => {
        const initChat = () => {
            try {
                if (!process.env.API_KEY) {
                    setChatHistory([{ role: 'model', text: 'Sorry, API Key not configured. AI Dost cannot start.' }]);
                    return;
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const systemInstruction = `You are 'AI Dost', a friendly and helpful AI assistant. Your personality is direct, honest, and straightforward. You communicate in simple Hinglish, like talking to a friend. NEVER be manipulative or give vague, philosophical answers. Answer questions directly. You can analyze astrological data provided to you but also use your general knowledge. If you are asked to cross-check something, be honest about its accuracy based on the data. Your goal is to be a clear, understandable, and trustworthy friend.`;
                
                chatSession.current = ai.chats.create({
                    model: AI_DOST_MODEL,
                    config: {
                      systemInstruction: systemInstruction,
                    },
                  });

                setChatHistory([{ role: 'model', text: 'Hey! Main aapka AI Dost hoon. Kuch bhi pucho, seedha jawab milega!' }]);
            } catch (e) {
                console.error("Failed to initialize AI Dost:", e);
                setChatHistory([{ role: 'model', text: 'Sorry, AI Dost abhi available nahi hai. Kuch problem ho gayi.' }]);
            }
        };
        initChat();
    }, []);

    const handleSendMessage = async (message: string, file: File | null) => {
        if (!message.trim() && !file) return;

        setIsLoading(true);
        const userMessage: ChatMessage = { role: 'user', text: message };
        let parts: (string | { inlineData: { data: string, mimeType: string }})[] = [];

        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                const imagePart = {
                    inlineData: {
                      data: base64,
                      mimeType: mimeType,
                    },
                };
                parts.push(imagePart);
                userMessage.image = URL.createObjectURL(file); // for local preview
            } catch(e) {
                console.error("Error processing file:", e);
                setChatHistory(prev => [...prev, {role: 'model', text: "Sorry, file upload mein problem aa gayi."}]);
                setIsLoading(false);
                return;
            }
        }
        
        if (message.trim()) {
            parts.push(message);
        }

        setChatHistory(prev => [...prev, userMessage]);

        try {
            if (!chatSession.current) {
                throw new Error("Chat session not initialized");
            }
            
            const response = await chatSession.current.sendMessage({parts});
            const responseText = response.text ?? "Kuch samajh nahi aaya, dobara poocho?";
            setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);

        } catch (err) {
            console.error("Error sending message:", err);
            setChatHistory(prev => [...prev, { role: 'model', text: 'Oops! Kuch gadbad ho gayi. Dobara try karna.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <ChatBot
                history={chatHistory}
                onSend={handleSendMessage}
                isLoading={isLoading}
                title="AI Dost se Baat Karein"
                placeholder="Kuch bhi type karo ya photo upload karo..."
            />
        </div>
    );
};
