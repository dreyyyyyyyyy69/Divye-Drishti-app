import React, { useState } from 'react';
import type { KundaliDetails, ChatMessage, Language } from '../types';
import { generateKundali, summarizeText, chatWithAnalysis } from '../services/geminiService';
import { ResultCard } from './common/ResultCard';
import { Spinner } from './common/Spinner';
import { ChatBot } from './common/ChatBot';
import { AIGuru } from './AIGuru';

const InputField: React.FC<{
  label: string;
  name: keyof KundaliDetails;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder: string;
}> = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3
                 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      required
    />
  </div>
);

interface KundaliGeneratorProps {
  onBack: () => void;
  language: Language;
}

export const KundaliGenerator: React.FC<KundaliGeneratorProps> = ({ onBack, language }) => {
  const [details, setDetails] = useState<KundaliDetails>({
    name: '',
    dob: '',
    tob: '',
    pob: '',
  });
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(details).some(v => v === '')) {
      setError('Please fill in all the details.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    setSummary('');
    setChatHistory([]);
    try {
      // Fix: Added language argument to generateKundali call.
      const analysis = await generateKundali(details, language);
      setResult(analysis);
      setChatHistory([{ role: 'model', text: 'Aap is report ke baare mein kuch bhi pooch sakte hain.' }]);
    } catch (err) {
      console.error(err);
      setError('Failed to generate Kundali. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!result) return;
    setIsSummarizing(true);
    setSummary('');
    try {
      // Fix: Added language argument to summarizeText call.
      const summaryText = await summarizeText(result, language);
      setSummary(summaryText);
    } catch (err) {
      console.error(err);
      setSummary('Could not generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !result) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      // Fix: Added language argument to chatWithAnalysis call.
      const response = await chatWithAnalysis(result, message, language);
      setChatHistory([...newHistory, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { role: 'model', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsChatting(false);
    }
  };


  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full p-6 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-sm text-indigo-400 hover:text-white font-bold">← Dashboard</button>
          <h2 className="text-2xl font-semibold text-center font-hindi">Apni Janam Kundali Banwayein</h2>
          <div className="w-10"></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Poora Naam" name="name" value={details.name} onChange={handleChange} placeholder="Jaise, Rahul Kumar" />
          <InputField label="Janam Tarikh" name="dob" value={details.dob} onChange={handleChange} type="date" placeholder="" />
          <InputField label="Janam ka Samay" name="tob" value={details.tob} onChange={handleChange} type="time" placeholder="" />
          <InputField label="Janam Sthan" name="pob" value={details.pob} onChange={handleChange} placeholder="Jaise, Delhi, India" />
          
          {error && <p className="text-red-400 text-center">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg
                       hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <><Spinner /> Kundali ban rahi hai...</> : 'Kundali Banayein'}
          </button>
        </form>
      </div>
      {result && <ResultCard title="Janam Kundali ka Analysis" content={result} onSummarize={handleSummarize} isSummarizing={isSummarizing} />}
      {summary && <ResultCard title="Mukhya Jaankari (Summary)" content={summary} />}
      {result && (
        <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatBot 
                history={chatHistory} 
                onSend={(message) => handleSendMessage(message)} 
                isLoading={isChatting}
                title="Report Assistant"
                placeholder="Is report ke baare mein poochein..."
            />
            <AIGuru context={result} />
        </div>
      )}
    </div>
  );
};