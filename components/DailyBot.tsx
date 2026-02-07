
import React, { useState, useEffect } from 'react';
import { generateDailyPrediction, chatWithAnalysis } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { marked } from 'marked';
import type { Language, ChatMessage } from '../types';

export const DailyBot: React.FC<{ language: Language }> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [dailyData, setDailyData] = useState('');

  const initBot = async () => {
    if (dailyData && chatHistory.length > 0) return;
    setIsLoading(true);
    const res = await generateDailyPrediction(language);
    setDailyData(res);
    setChatHistory([{ role: 'model', text: res }]);
    setIsLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    const reply = await chatWithAnalysis(dailyData, userMsg, language);
    setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 h-[500px] bg-slate-900/95 border-2 border-indigo-500/50 rounded-3xl p-5 shadow-2xl animate-fade-in flex flex-col overflow-hidden backdrop-blur-xl">
           <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
              <h4 className="font-bold text-indigo-400 font-hindi flex items-center gap-2">
                <span className="text-xl">🔮</span> Aaj ka Rashifal
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 h-6 w-6 rounded-full flex items-center justify-center">×</button>
           </div>
           <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-1 text-sm text-slate-300 scrollbar-hide">
              {chatHistory.map((m, i) => (
                <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-2xl max-w-[90%] ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700'}`}>
                    <div className="prose prose-invert prose-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(m.text) as string }} />
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start p-2"><Spinner /></div>}
           </div>
           <form onSubmit={handleSend} className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'english' ? "Ask about today..." : "Aaj ke bare mein poochein..."}
                className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 p-2 rounded-xl hover:bg-indigo-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
           </form>
        </div>
      )}
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) initBot(); }}
        className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse hover:animate-none ring-4 ring-white/10"
      >
        <span className="text-3xl">🤖</span>
      </button>
    </div>
  );
};
