
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import { Spinner } from './Spinner';
import { SendIcon } from '../icons/SendIcon';
import { AttachmentIcon } from '../icons/AttachmentIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { ThumbUpIcon } from '../icons/ThumbUpIcon';
import { ThumbDownIcon } from '../icons/ThumbDownIcon';
import { marked } from 'marked';

interface ChatBotProps {
    history: ChatMessage[];
    onSend: (message: string, file?: File | null) => void;
    isLoading: boolean;
    title?: string;
    placeholder?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
    history, 
    onSend, 
    isLoading, 
    title = "Divya Drishti AI Assistant", 
    placeholder = "Is vishleshan ke baare mein kuch poochein..." 
}) => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() || selectedFile) {
            onSend(input, selectedFile);
            setInput('');
            setSelectedFile(null);
            setFilePreview(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getHTML = (content: string) => {
        return { __html: marked.parse(content) as string };
    };

    return (
        <div className="w-full h-full p-4 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm flex flex-col animate-fade-in">
            <h3 className="text-xl font-bold text-center mb-4 text-indigo-400 font-hindi">{title}</h3>
            <div className="flex-grow h-96 overflow-y-auto pr-2 space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                         <div
                            className={`relative group max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-slate-700 text-slate-200'
                            }`}
                        >
                            {msg.role === 'model' && (
                                <button onClick={() => handleCopy(msg.text, index)} className="absolute top-2 right-2 p-1 bg-slate-600/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <CopyIcon isCopied={copiedIndex === index} />
                                </button>
                            )}
                            {msg.image && (
                                <img src={msg.image} alt="User upload preview" className="rounded-md mb-2 max-h-48" />
                            )}
                            <div
                                className="prose prose-invert prose-sm max-w-none prose-p:my-1" 
                                dangerouslySetInnerHTML={getHTML(msg.text)} 
                            />
                             {msg.role === 'model' && (
                                <div className="mt-3 border-t border-slate-600/50 pt-2 flex items-center justify-between">
                                    {msg.confidence !== undefined && (
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <strong>Accuracy:</strong>
                                            <div title={`${msg.confidence}%`} className="w-12 bg-slate-600 rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${msg.confidence}%` }}></div>
                                            </div>
                                            <span className="font-semibold">{msg.confidence}%</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"><ThumbUpIcon /></button>
                                        <button className="p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"><ThumbDownIcon /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl bg-slate-700 text-slate-200">
                           <Spinner/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 border-t border-slate-700 pt-4">
                {filePreview && (
                    <div className="mb-2 p-2 bg-slate-700 rounded-lg relative w-fit">
                        <img src={filePreview} alt="Preview" className="h-20 w-auto rounded" />
                        <button 
                            type="button"
                            onClick={() => {
                                setSelectedFile(null);
                                setFilePreview(null);
                                if(fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-xs"
                        >
                            X
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        id="file-upload"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-600 text-white p-2 rounded-lg hover:bg-slate-500 transition-colors"
                        disabled={isLoading}
                        aria-label="Attach file"
                    >
                        <AttachmentIcon />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-lg shadow-sm py-2 px-4
                                text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 transition-colors"
                        disabled={isLoading || (!input.trim() && !selectedFile)}
                        aria-label="Send message"
                    >
                    <SendIcon/>
                    </button>
                </div>
            </form>
        </div>
    );
};
