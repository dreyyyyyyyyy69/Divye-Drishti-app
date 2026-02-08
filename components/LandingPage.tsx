
import React from 'react';
import type { Language } from '../types';

interface LandingPageProps {
  onStartNew: () => void;
  onLoadPrevious: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartNew, onLoadPrevious, language, setLanguage }) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-12 py-6 sm:py-12 animate-fade-in px-2">
      <div className="text-center space-y-2 sm:space-y-4">
        <h2 className="text-2xl sm:text-4xl font-bold font-hindi text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 leading-tight">
          Swagat Hai! Kaise Madad Karein?
        </h2>
        <p className="text-xs sm:text-slate-400">Aapki suvidha ke anusar chunein.</p>
      </div>

      <div className="w-full bg-slate-800/50 p-5 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6 sm:space-y-8">
        {/* Language Toggle */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Bhasha Chunein (Language)</p>
          <div className="flex bg-slate-900 p-1 rounded-xl">
            <button 
              onClick={() => setLanguage('hinglish')}
              className={`flex-1 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-bold transition-all ${language === 'hinglish' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Hinglish
            </button>
            <button 
              onClick={() => setLanguage('english')}
              className={`flex-1 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-bold transition-all ${language === 'english' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
          <button 
            onClick={onStartNew}
            className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-6 sm:p-8 bg-indigo-600/10 border border-indigo-500/50 rounded-2xl hover:bg-indigo-600 transition-all group"
          >
            <div className="w-10 h-10 sm:w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span className="font-bold text-base sm:text-lg">Naya Shuru Karein</span>
            <span className="text-[8px] sm:text-[10px] uppercase opacity-60">Start New Session</span>
          </button>

          <button 
            onClick={onLoadPrevious}
            className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-6 sm:p-8 bg-slate-700/50 border border-slate-600 rounded-2xl hover:bg-slate-700 transition-all group"
          >
            <div className="w-10 h-10 sm:w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <span className="font-bold text-base sm:text-lg">Puran Reports</span>
            <span className="text-[8px] sm:text-[10px] uppercase opacity-60">Load Saved History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
