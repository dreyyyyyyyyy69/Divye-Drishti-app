
import React, { useState, useEffect } from 'react';
import type { Section, UserApiKey, UserProfile } from '../types';
import { PalmIcon } from './icons/PalmIcon';
import { StarIcon } from './icons/StarIcon';
import { CareerIcon } from './icons/CareerIcon';
import { MahaKundaliIcon } from './icons/MahaKundaliIcon';
import { KeyIcon } from './icons/KeyIcon';
import { auth, db } from '../services/firebase';
// @ts-ignore
import { signOut } from "firebase/auth";
// @ts-ignore
import { doc, getDoc, setDoc } from "firebase/firestore";

interface HeaderProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  user: any;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, user, profile, setProfile }) => {
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [keyList, setKeyList] = useState<UserApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState(localStorage.getItem('active_gemini_key_id') || '');

  // Load keys from Firestore on mount
  useEffect(() => {
    const loadKeys = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "userSettings", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.keys) setKeyList(data.keys);
          if (data.activeKeyId) {
             setActiveKeyId(data.activeKeyId);
             const activeKey = data.keys.find((k: any) => k.id === data.activeKeyId);
             if (activeKey) localStorage.setItem('user_gemini_key', activeKey.key);
          }
        } else {
          // Fallback to local storage if firestore is empty
          const localKeys = JSON.parse(localStorage.getItem('user_gemini_keys') || '[]');
          setKeyList(localKeys);
        }
      } catch (e) { console.error("Error loading keys:", e); }
    };
    loadKeys();
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm("Logout karein?")) {
      try {
        localStorage.removeItem('user_gemini_key');
        localStorage.removeItem('active_gemini_key_id');
        await signOut(auth);
        window.location.reload(); 
      } catch (err) { console.error("Logout error", err); }
    }
  };

  const syncKeysToFirestore = async (newList: UserApiKey[], activeId: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "userSettings", user.uid), {
        keys: newList,
        activeKeyId: activeId
      }, { merge: true });
    } catch (e) { console.error("Firestore sync error:", e); }
  };

  const handleAddKey = async () => {
    if (!keyName || !keyValue) return;
    const newKey: UserApiKey = { id: Math.random().toString(36).substr(2, 9), name: keyName, key: keyValue };
    const newList = [...keyList, newKey];
    setKeyList(newList);
    let newActiveId = activeKeyId;
    if (newList.length === 1) {
        newActiveId = newKey.id;
        handleSelectKey(newKey.id, newKey.key);
    }
    localStorage.setItem('user_gemini_keys', JSON.stringify(newList));
    await syncKeysToFirestore(newList, newActiveId);
    setKeyName(''); setKeyValue('');
  };

  const handleSelectKey = async (id: string, key: string) => {
    setActiveKeyId(id);
    localStorage.setItem('active_gemini_key_id', id);
    localStorage.setItem('user_gemini_key', key);
    await syncKeysToFirestore(keyList, id);
  };

  const handleDeleteKey = async (id: string) => {
    const newList = keyList.filter(k => k.id !== id);
    setKeyList(newList);
    let newActiveId = activeKeyId;
    if (activeKeyId === id) {
      localStorage.removeItem('user_gemini_key');
      localStorage.removeItem('active_gemini_key_id');
      newActiveId = '';
      setActiveKeyId('');
    }
    localStorage.setItem('user_gemini_keys', JSON.stringify(newList));
    await syncKeysToFirestore(newList, newActiveId);
  };

  return (
    <header className="flex flex-col items-center w-full relative mb-6 sm:mb-12 px-2">
      <div className="w-full flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 sm:gap-3 relative group">
          <div 
            onClick={() => setShowProfileSettings(!showProfileSettings)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white cursor-pointer hover:bg-indigo-500 transition-all ring-2 ring-indigo-500/20"
          >
            {profile.name ? profile.name[0].toUpperCase() : user.email?.[0].toUpperCase()}
          </div>
          <div className="hidden xs:block cursor-pointer" onClick={() => setShowProfileSettings(!showProfileSettings)}>
            <p className="text-xs sm:text-sm font-bold text-slate-200">{profile.name || 'Apna Naam'}</p>
            <div className="flex gap-1 sm:gap-2">
               <p className="text-[8px] sm:text-[10px] text-slate-500 bg-slate-800/50 px-2 rounded backdrop-blur-md select-none">Age: <span className="blur-[3px] group-hover:blur-none transition-all">{profile.age || '??'}</span></p>
               <p className="text-[8px] sm:text-[10px] text-slate-500 bg-slate-800/50 px-2 rounded backdrop-blur-md select-none">City: <span className="blur-[3px] group-hover:blur-none transition-all">{profile.address || '??'}</span></p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-[8px] sm:text-[10px] font-bold text-red-400 hover:text-red-300 ml-2 px-2 py-1 bg-red-400/10 rounded border border-red-400/20">OUT</button>
        </div>

        <div className="flex flex-col items-end gap-2">
           <button onClick={() => setShowKeySettings(!showKeySettings)} className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-lg ${activeKeyId ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-slate-300 border border-slate-600'}`}>
             <KeyIcon /> {activeKeyId ? 'Ready' : 'Key Dalein'}
           </button>
           {showKeySettings && (
             <div className="absolute top-12 right-0 z-[110] w-64 sm:w-72 bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl animate-fade-in ring-1 ring-white/10">
               <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-xs sm:text-sm text-slate-200">API Key Manager</h4>
                 <button onClick={() => setShowKeySettings(false)} className="text-slate-500 text-xs">Close</button>
               </div>
               <div className="space-y-2 mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                 <input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Key Name" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px]" />
                 <input type="password" value={keyValue} onChange={(e) => setKeyValue(e.target.value)} placeholder="Paste Key..." className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[10px]" />
                 <button onClick={handleAddKey} className="w-full bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-lg text-[10px] font-bold transition-all">Save Key</button>
               </div>
               <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                 {keyList.map(k => (
                   <div key={k.id} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${activeKeyId === k.id ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-900/30'}`} onClick={() => handleSelectKey(k.id, k.key)}>
                        <p className={`text-[10px] font-bold ${activeKeyId === k.id ? 'text-green-400' : 'text-slate-300'}`}>{k.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteKey(k.id); }} className="text-slate-600 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>

      <div className="text-center mb-6 cursor-pointer" onClick={() => setActiveSection('landing')}>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-indigo-600 font-hindi tracking-tight">दिव्य दृष्टि AI</h1>
        <p className="mt-1 text-slate-500 uppercase tracking-widest text-[8px] sm:text-[10px] font-bold">Personalized Destiny Portal {new Date().getFullYear()}</p>
      </div>
      
      {activeSection !== 'landing' && (
        <nav className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-wrap justify-center gap-1.5 sm:gap-2">
           <button onClick={() => setActiveSection('dashboard')} className="px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all">🏠 Home</button>
           <div className="w-px h-6 sm:h-8 bg-slate-700/50 mx-0.5 self-center"></div>
           <NavButton activeSection={activeSection} s="palmistry" icon={<PalmIcon />} label="Palm" onClick={() => setActiveSection('palmistry')} />
           <NavButton activeSection={activeSection} s="kundali" icon={<StarIcon />} label="Stars" onClick={() => setActiveSection('kundali')} />
           <NavButton activeSection={activeSection} s="bnn" icon={<CareerIcon />} label="Jobs" onClick={() => setActiveSection('bnn')} />
           <NavButton activeSection={activeSection} s="mahaKundali" icon={<MahaKundaliIcon />} label="Maha" onClick={() => setActiveSection('mahaKundali')} />
        </nav>
      )}
    </header>
  );
};

const NavButton = ({ activeSection, s, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all ${activeSection === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700'}`}>
    {React.cloneElement(icon, { size: 14 })}
    <span>{label}</span>
  </button>
);
