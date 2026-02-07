
import React from 'react';
import { marked } from 'marked';
import { Spinner } from './Spinner';

interface ResultCardProps {
  title: string;
  content: string;
  onSummarize?: () => void;
  isSummarizing?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, content, onSummarize, isSummarizing }) => {
  const getHTML = () => {
    return { __html: marked.parse(content) as string };
  };

  return (
    <div className="w-full p-6 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm animate-fade-in">
      <h3 className="text-2xl font-bold text-center mb-4 text-indigo-400 font-hindi">{title}</h3>
      <div 
        className="prose prose-invert prose-slate max-w-none 
                   prose-headings:text-indigo-300 prose-strong:text-slate-100"
        dangerouslySetInnerHTML={getHTML()}
      />
      {onSummarize && (
        <div className="mt-6 text-center">
          <button
            onClick={onSummarize}
            disabled={isSummarizing}
            className="bg-slate-700 text-slate-200 font-semibold py-2 px-6 rounded-lg
                       hover:bg-slate-600 disabled:bg-slate-500 disabled:cursor-not-allowed
                       transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isSummarizing ? <><Spinner /> Summarizing...</> : 'Mukhya Jaankari (Summary)'}
          </button>
        </div>
      )}
    </div>
  );
};
