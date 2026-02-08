
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PalmistryReader } from './components/PalmistryReader';
import { KundaliGenerator } from './components/KundaliGenerator';
import { BnnKundaliGenerator } from './components/BnnKundaliGenerator';
import { MahaKundali } from './components/MahaKundali';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { CommunityWall } from './components/CommunityWall';
import { DailyBot } from './components/DailyBot';
import { auth } from './services/firebase';
// @ts-ignore
import { onAuthStateChanged } from "firebase/auth";
import type { Section, Language, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('landing');
  const [language, setLanguage] = useState<Language>('hinglish');
  const [viewingHistoryContent, setViewingHistoryContent] = useState<{title: string, content: string} | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : { name: '', age: '', address: '' };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (!currentUser) {
        setActiveSection('landing');
        setViewingHistoryContent(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-hindi">Shubh Aarambh...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const handleBackToDashboard = () => {
    setActiveSection('dashboard');
    setViewingHistoryContent(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[90vh]">
        <Header activeSection={activeSection} setActiveSection={setActiveSection} user={user} profile={profile} setProfile={setProfile} />
        
        <main className="mt-8 flex-grow">
          {activeSection === 'landing' && (
            <LandingPage onStartNew={() => setActiveSection('dashboard')} onLoadPrevious={() => setActiveSection('dashboard')} language={language} setLanguage={setLanguage} />
          )}

          {activeSection === 'dashboard' && (
            <Dashboard onNewSection={(s) => setActiveSection(s)} onViewHistory={(title, content) => setViewingHistoryContent({title, content})} />
          )}
          
          {activeSection === 'palmistry' && <PalmistryReader onBack={handleBackToDashboard} language={language} />}
          {activeSection === 'kundali' && <KundaliGenerator onBack={handleBackToDashboard} language={language} />}
          {activeSection === 'bnn' && <BnnKundaliGenerator onBack={handleBackToDashboard} language={language} />}
          {activeSection === 'mahaKundali' && <MahaKundali onBack={handleBackToDashboard} language={language} />}
          
          {viewingHistoryContent && (
             <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-800 border border-slate-700 w-full max-w-3xl rounded-2xl p-8 shadow-2xl relative animate-fade-in">
                  <button onClick={() => setViewingHistoryContent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">Close [X]</button>
                  <h2 className="text-3xl font-bold mb-6 text-indigo-400 font-hindi border-b border-slate-700 pb-2">{viewingHistoryContent.title}</h2>
                  <div className="prose prose-invert prose-slate max-w-none prose-headings:text-indigo-300">
                    <div dangerouslySetInnerHTML={{ __html: viewingHistoryContent.content }} />
                  </div>
                </div>
             </div>
          )}
        </main>

        {activeSection !== 'landing' && <CommunityWall />}

        <footer className="text-center text-slate-600 mt-12 pb-6 pt-8 border-t border-slate-800/50">
          <p className="text-xs uppercase tracking-widest font-bold">Divya Drishti AI © {new Date().getFullYear()}</p>
          <p className="font-hindi text-indigo-500/70 mt-1 text-sm">Made by Anish</p>
        </footer>
      </div>

      <DailyBot language={language} />
    </div>
  );
};

export default App;
