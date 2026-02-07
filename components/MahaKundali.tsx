
import React, { useState, useEffect } from 'react';
import type { MahaKundaliDetails, ChatMessage, Language, SavedChart } from '../types';
import { generateMahaKundali, chatWithMahaKundali } from '../services/geminiService';
import { Spinner } from './common/Spinner';
import { ChatBot } from './common/ChatBot';
import { AIGuru } from './AIGuru';
import { marked } from 'marked';
import { db, auth } from '../services/firebase';
// @ts-ignore
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const MaskedInputField: React.FC<{
  label: string;
  name: keyof MahaKundaliDetails;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, name, value, onChange, type = 'text', placeholder }) => {
  const [isMasked, setIsMasked] = useState(true);
  const isSensitive = type === 'date' || type === 'time' || name === 'pob';

  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-400 font-hindi mb-1">{label}</label>
      <div className="relative">
        <input
          type={isSensitive && isMasked ? 'password' : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isSensitive && isMasked ? 'tracking-[0.5em]' : ''}`}
          required
        />
        {isSensitive && (
          <button 
            type="button"
            onClick={() => setIsMasked(!isMasked)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] bg-slate-700 px-2 py-1 rounded text-slate-300 font-bold uppercase"
          >
            {isMasked ? 'Show' : 'Hide'}
          </button>
        )}
      </div>
    </div>
  );
};

interface MahaKundaliProps {
  onBack: () => void;
  language: Language;
}

export const MahaKundali: React.FC<MahaKundaliProps> = ({ onBack, language }) => {
  const [details, setDetails] = useState<MahaKundaliDetails>({ name: '', dob: '', tob: '', pob: '', gender: '' });
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchSavedCharts = async () => {
    if (!auth.currentUser) return;
    setIsProfileLoading(true);
    try {
        const q = query(collection(db, "userCharts"), where("userId", "==", auth.currentUser.uid));
        const snap = await getDocs(q);
        const charts: SavedChart[] = [];
        snap.forEach((doc: any) => charts.push({ id: doc.id, ...doc.data() } as SavedChart));
        setSavedCharts(charts);
    } catch (e) { console.error(e); }
    finally { setIsProfileLoading(false); }
  };

  const handleSaveChartAsProfile = async () => {
    if (!details.name || !details.dob) { alert("Pehle jankari bharein!"); return; }
    if (!auth.currentUser) return;
    try {
        await addDoc(collection(db, "userCharts"), {
            userId: auth.currentUser.uid,
            ...details,
            createdAt: serverTimestamp()
        });
        alert("Naya profile save ho gaya!");
        fetchSavedCharts();
    } catch (e) { alert("Save nahi ho paya."); }
  };

  const selectChart = (chart: SavedChart) => {
    setDetails({ name: chart.name, dob: chart.dob, tob: chart.tob, pob: chart.pob, gender: chart.gender as any });
    setShowProfileModal(false);
  };

  const deleteChart = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Is profile ko delete karein?")) return;
    try {
        await deleteDoc(doc(db, "userCharts", id));
        setSavedCharts(savedCharts.filter(c => c.id !== id));
    } catch (e) { alert("Delete failed."); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setResult('');
    try {
      const analysis = await generateMahaKundali(details, language);
      setResult(analysis);
      setChatHistory([{ role: 'model', text: language === 'english' ? 'Maha Kundali is ready. You can ask questions.' : 'Maha Kundali taiyar hai. Sawaal poochein.' }]);
    } catch (err) { setError('Error generating Kundali.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in pb-20">
      <div className="w-full p-8 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-2xl relative">
        <button 
            onClick={() => { setShowProfileModal(true); fetchSavedCharts(); }} 
            className="absolute top-6 right-8 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all font-bold"
        >
            👤 Use Saved Profiles
        </button>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-sm text-indigo-400 font-bold hover:underline">← Home</button>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 font-hindi">Maha Kundali</h2>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaskedInputField label="Aapka Naam" name="name" value={details.name} onChange={handleChange} placeholder="Anish Kumar" />
            <div>
              <label className="block text-sm font-medium text-slate-400 font-hindi mb-1">Ling (Gender)</label>
              <select name="gender" value={details.gender} onChange={handleChange} className="block w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-slate-200 outline-none" required>
                <option value="">Chunein...</option>
                <option value="male">Purush (Male)</option>
                <option value="female">Mahila (Female)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaskedInputField label="Janam Tarikh" name="dob" value={details.dob} onChange={handleChange} type="date" />
            <MaskedInputField label="Janam Samay" name="tob" value={details.tob} onChange={handleChange} type="time" />
          </div>
          <MaskedInputField label="Janam Sthan (City)" name="pob" value={details.pob} onChange={handleChange} placeholder="Bokaro, Jharkhand" />
          
          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50">
                {isLoading ? <Spinner /> : 'Maha Kundali Banayein'}
            </button>
            <button type="button" onClick={handleSaveChartAsProfile} className="bg-slate-700 hover:bg-slate-600 px-6 rounded-2xl text-slate-300 font-bold text-xs">
                Save Profile
            </button>
          </div>
        </form>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-fade-in">
                <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">X</button>
                <h3 className="text-xl font-bold text-indigo-400 mb-6 font-hindi">Mere Saved Profiles</h3>
                <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-tighter">Privacy: Sirf naam dikhaye ja rahe hain.</p>
                {isProfileLoading ? <div className="p-12 flex justify-center"><Spinner /></div> : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {savedCharts.length === 0 ? <p className="text-slate-500 italic text-center py-4">Koi profile nahi mila.</p> : 
                            savedCharts.map(c => (
                                <div key={c.id} onClick={() => selectChart(c)} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl hover:bg-indigo-500/10 cursor-pointer flex justify-between items-center group transition-all">
                                    <p className="font-bold text-slate-200">{c.name}</p>
                                    <button onClick={(e) => deleteChart(c.id, e)} className="text-slate-700 hover:text-red-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
      )}

      {result && (
        <div className="w-full space-y-6">
          <div className="relative p-8 bg-slate-800 border-2 border-amber-500/30 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold text-amber-400 font-hindi mb-6 border-b border-slate-700 pb-2">Sampoorn Analysis</h3>
            <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: marked.parse(result) as string }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatBot history={chatHistory} onSend={(m) => chatWithMahaKundali(result, m, language).then(r => setChatHistory([...chatHistory, {role:'user', text:m}, {role:'model', text:r}]))} isLoading={isChatting} title="Poochiye Guru se" />
            <AIGuru context={result} />
          </div>
        </div>
      )}
    </div>
  );
};
