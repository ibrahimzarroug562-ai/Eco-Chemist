import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Maximize2, Minimize2, Send, Sparkles, AlertCircle, MessageSquare, Zap, Activity, Info } from 'lucide-react';
import { chatWithGreenTutor } from '../services/geminiService';
import { Language, UserStats } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ContextInfo {
    activeView: string;
    stats: UserStats;
    currentAction?: string;
}

interface GreenCompanionProps {
    lang: Language;
    context: ContextInfo;
}

interface Message {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

const GreenCompanion: React.FC<GreenCompanionProps> = ({ lang, context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    // Initial greeting based on context
    useEffect(() => {
        if (messages.length === 0) {
            const greeting = lang === 'en'
                ? `Hi! I'm your Green Companion. You're currently in the ${context.activeView}. Need help analyzing something?`
                : `أهلاً بك! أنا رفيقك الأخضر. أنت الآن في ${context.activeView === 'home' ? 'الرئيسية' : context.activeView === 'scanner' ? 'ماسح البوليمر' : 'المختبر'}. هل تحتاج للمساعدة؟`;

            setMessages([{
                role: 'model',
                content: greeting,
                timestamp: Date.now()
            }]);
        }
    }, [context.activeView]);

    // Periodic suggestions based on stats
    useEffect(() => {
        if (context.stats.xp % 100 === 0 && context.stats.xp > 0) {
            setSuggestion(lang === 'ar' ? 'لقد حققت تقدماً رائعاً! هل تريد معرفة كيفية زيادة نقاط الأثر البيئي (EIP)؟' : 'Great progress! Want to know how to boost your Environmental Impact Points?');
        }
    }, [context.stats.xp]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Create contextual prompt
            const contextualMessage = `[CONTEXT: User is currently viewing "${context.activeView}". User Stats: Level ${context.stats.level}, XP ${context.stats.xp}. Current Rank: ${context.stats.rank_ar}] \n\n User Question: ${input}`;

            const history = messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const response = await chatWithGreenTutor(history, contextualMessage, lang);

            setMessages(prev => [...prev, {
                role: 'model',
                content: typeof response === 'string' ? response : JSON.stringify(response),
                timestamp: Date.now()
            }]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[200] group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Bot size={32} className="relative z-10" />
                {suggestion && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-bounce"></span>
                )}
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col transition-all z-[200] overflow-hidden ${isMinimized ? 'h-20' : 'h-[600px] max-h-[80vh]'}`}>

            {/* Decorative Glows */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                            Green Companion
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        </h4>
                        <span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest">
                            {context.activeView === 'home' ? 'Analyzing Dashboard...' : `Analyzing ${context.activeView}...`}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
                        {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Dashboard Context Bar */}
                    <div className="px-5 py-2 bg-emerald-500/5 flex items-center gap-4 border-b border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                            <Activity size={12} />
                            <span>LVL {context.stats.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold">
                            <Zap size={12} />
                            <span>{context.stats.xp} XP</span>
                        </div>
                        <div className="ml-auto text-[10px] text-slate-500 font-medium italic">
                            Context-Aware AI
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-none shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        className="prose prose-invert prose-sm"
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 p-4 bg-slate-800/30 rounded-2xl w-20 justify-center border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestion Box */}
                    {suggestion && !isLoading && messages.length < 5 && (
                        <div className="px-5 pb-2">
                            <button
                                onClick={() => { setInput(suggestion); handleSend(); setSuggestion(null); }}
                                className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-300 text-left hover:bg-emerald-500/20 transition-all flex items-center gap-3 group"
                            >
                                <Info size={14} className="group-hover:rotate-12 transition-transform" />
                                {suggestion}
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-5 bg-white/5 backdrop-blur-md">
                        <div className="relative flex items-center bg-slate-800/50 rounded-2xl border border-white/10 focus-within:border-emerald-500/50 transition-all">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={lang === 'ar' ? 'اسأل مساعدك الأخضر...' : 'Ask your Green Companion...'}
                                className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2 mr-1 bg-emerald-500 text-white rounded-xl disabled:opacity-50 hover:bg-emerald-400 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GreenCompanion;
