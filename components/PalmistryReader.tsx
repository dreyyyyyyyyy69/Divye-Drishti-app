
import React, { useState } from 'react';
import { analyzePalm, chatWithAnalysis } from '../services/geminiService';
import { ResultCard } from './common/ResultCard';
import { Spinner } from './common/Spinner';
import type { ChatMessage, Language } from '../types';
import { ChatBot } from './common/ChatBot';
import { AIGuru } from './AIGuru';
import { db, auth } from '../services/firebase';
// @ts-ignore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PalmistryReaderProps {
  onBack: () => void;
  language: Language;
}

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

export const PalmistryReader: React.FC<PalmistryReaderProps> = ({ onBack, language }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("File too large (Max 4MB).");
        return;
      }
      setError('');
      setResult('');
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        type: 'palmistry',
        title: "Palm Reading - " + new Date().toLocaleTimeString(),
        content: result,
        timestamp: serverTimestamp()
      });
      alert("Report successfully save ho gayi hai!");
    } catch (e) {
      console.error("Save Error", e);
      alert("Save karne mein dikkat aayi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Please select an image.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { base64, mimeType } = await fileToBase64(imageFile);
      const analysis = await analyzePalm(base64, mimeType, language);
      setResult(analysis);
      setChatHistory([{ role: 'model', text: 'Aap is report ke baare mein kuch bhi pooch sakte hain.' }]);
    } catch (err) {
      setError('Failed to analyze the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in pb-24">
      <div className="w-full p-8 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-sm text-indigo-400 hover:text-white font-bold">← Dashboard</button>
          <h2 className="text-2xl font-bold font-hindi">Hast Rekha Reader ({language === 'hinglish' ? 'हिन्दी' : 'English'})</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-md bg-slate-900/50 p-12 border-2 border-dashed border-slate-700 rounded-3xl text-center relative hover:border-indigo-500 transition-colors">
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-slate-300 font-bold">Hath ki photo dalein</p>
            </div>
          </div>
          {previewUrl && <img src={previewUrl} className="max-w-xs h-auto border-4 border-slate-700 rounded-xl" />}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!imageFile || isLoading}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg"
        >
          {isLoading ? <Spinner /> : 'Vishleshan Karein'}
        </button>
      </div>

      {result && (
        <div className="w-full space-y-6">
          <div className="relative">
            <ResultCard title="Aapki Report" content={result} />
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : '💾 Save to History'}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatBot 
                history={chatHistory} 
                onSend={(m) => chatWithAnalysis(result, m, language).then(r => setChatHistory([...chatHistory, {role:'user', text:m}, {role:'model', text:r}]))} 
                isLoading={false}
                title="AI Support"
            />
            <AIGuru context={result} />
          </div>
        </div>
      )}
    </div>
  );
};
