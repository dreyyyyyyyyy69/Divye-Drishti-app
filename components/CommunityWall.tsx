
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { collection, query, limit, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from '../services/firebase';
import { Spinner } from './common/Spinner';
import type { CommunityPost } from '../types';

export const CommunityWall: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "communityPosts"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const p: CommunityPost[] = [];
      snapshot.forEach((doc: any) => p.push({ id: doc.id, ...doc.data() } as CommunityPost));
      setPosts(p);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const user = auth.currentUser;
    try {
      await addDoc(collection(db, "communityPosts"), {
        userName: user?.displayName || user?.email?.split('@')[0] || "Anonymous",
        text: inputText,
        timestamp: serverTimestamp()
      });
      setInputText('');
    } catch (e) { alert("Post failed."); }
  };

  return (
    <div className="w-full bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700 p-8 shadow-2xl mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold font-hindi text-indigo-400">दुनियां का मंच (Community Wall)</h3>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Connect with everyone globally</p>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2 scrollbar-hide">
        {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
          posts.map(post => (
            <div key={post.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-indigo-500 uppercase">{post.userName}</p>
                <p className="text-[8px] text-slate-600">{post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleTimeString() : 'now'}</p>
              </div>
              <p className="text-sm text-slate-300">{post.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handlePost} className="flex gap-2">
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Apne vichar ya feedback post karein..."
          className="flex-grow bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all">Post</button>
      </form>
    </div>
  );
};
