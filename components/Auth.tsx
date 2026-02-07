
import React, { useState } from 'react';
// @ts-ignore
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../services/firebase';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 font-hindi text-center mb-2">
          दिव्य दृष्टि AI
        </h1>
        <p className="text-slate-400 text-center mb-8">Swagat hai! Kripya login karein.</p>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
          </button>
        </form>

        <div className="relative my-6 text-center">
            <span className="bg-slate-800 px-3 text-xs text-slate-500 relative z-10">OR</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "Naye user hain?" : "Already account hai?"} 
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-400 hover:underline font-bold"
          >
            {isLogin ? "Account Banayein" : "Login Karein"}
          </button>
        </p>
      </div>
    </div>
  );
};
