
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { collection, query, where, getDocs, limit, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from '../services/firebase';
import { PalmIcon } from './icons/PalmIcon';
import { StarIcon } from './icons/StarIcon';
import { CareerIcon } from './icons/CareerIcon';
import { MahaKundaliIcon } from './icons/MahaKundaliIcon';
import type { Section, HistoryItem } from '../types';

interface DashboardProps {
  onNewSection: (s: Section) => void;
  onViewHistory: (title: string, content: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewSection, onViewHistory }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(
        collection(db, "reports"), 
        where("userId", "==", user.uid),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const items: HistoryItem[] = [];
      querySnapshot.forEach((doc: any) => {
        items.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setHistory(items);
    } catch (e: any) {
      console.error("Error fetching history:", e);
      setError("History load karne mein dikkat aayi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Kya aap ise delete karna chahte hain?")) return;
    try {
      await deleteDoc(doc(db, "reports", id));
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      alert("Delete nahi ho paya.");
    }
  };

  const menuItems = [
    { id: 'palmistry' as Section, label: 'Hast Rekha Reading', icon: <PalmIcon />, color: 'bg-blue-500' },
    { id: 'kundali' as Section, label: 'Janam Kundali', icon: <StarIcon />, color: 'bg-purple-500' },
    { id: 'bnn' as Section, label: 'Career (BNN)', icon: <CareerIcon />, color: 'bg-green-500' },
    { id: 'mahaKundali' as Section, label: 'Maha Kundali', icon: <MahaKundaliIcon />, color: 'bg-orange-500' },
  ];

  return (
    <div className="w-full space-y-12 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold font-hindi mb-6 flex items-center gap-3">
          <span className="text-indigo-400">✨</span> Naya Vishleshan Karein
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNewSection(item.id)}
              className="flex flex-col items-center justify-center p-6 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-750 hover:border-indigo-500 transition-all group"
            >
              <div className={`p-4 rounded-xl ${item.color} bg-opacity-20 text-white mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="font-bold text-slate-200 text-sm sm:text-base">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold font-hindi mb-6 flex items-center gap-3">
          <span className="text-indigo-400">📜</span> Pichli Reports (History)
        </h2>
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm italic">
                {error}
            </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onViewHistory(item.title, item.content)}
                className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl hover:bg-slate-800 transition-all cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                  <p className="text-[10px] text-slate-500">Report Date: {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleDateString() : 'Saving...'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => handleDeleteHistory(e, item.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-indigo-400"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/30 border border-dashed border-slate-700 p-12 rounded-2xl text-center">
            <p className="text-slate-500 italic font-hindi">Abhi tak koi report save nahi hui hai.</p>
          </div>
        )}
      </div>
    </div>
  );
};
