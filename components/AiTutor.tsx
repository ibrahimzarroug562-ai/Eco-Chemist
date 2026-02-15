import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, ShieldCheck, Loader2, XCircle } from 'lucide-react';
import { chatWithGreenTutor } from '../services/geminiService';
import { Language } from '../types';
import { sanitizeInput, detectPromptInjection, aiChatRateLimiter, filterAIResponse } from '../utils/security';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface AiTutorProps {
  lang: Language;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isFlagged?: boolean;
}

const AiTutor: React.FC<AiTutorProps> = ({ lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: lang === 'en'
        ? "Hello! I'm your Eco-Chemist AI assistant. How can I help you with your chemistry studies or environmental research today?"
        : "مرحباً! أنا مساعدك الذكي في Eco-Chemist. كيف يمكنني مساعدتك في دراستك للكيمياء أو أبحاثك البيئية اليوم؟",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. Input Sanitization
    const sanitizedInput = sanitizeInput(input);
    const userMessage: Message = {
      role: 'user',
      content: sanitizedInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSecurityWarning(null);

    // 2. Prompt Injection Detection
    if (detectPromptInjection(sanitizedInput)) {
      setSecurityWarning(lang === 'en'
        ? "Security Alert: Potential prompt injection detected. Request blocked."
        : "تنبيه أمني: تم اكتشاف محاولة تلاعب بالنظام. تم حظر الطلب.");
      return;
    }

    // 3. Rate Limiting
    if (!aiChatRateLimiter.isAllowed('user-session')) {
      setSecurityWarning(lang === 'en'
        ? "Rate limit exceeded. Please wait a moment."
        : "تم تجاوز حد الطلبات. يرجى الانتظار قليلاً.");
      return;
    }

    setIsLoading(true);

    try {
      // 4. Secure API Call with History
      // Convert messages to history format expected by geminiService
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await chatWithGreenTutor(history, sanitizedInput, lang);

      // 5. Output Filtering
      const stringResponse = typeof response === 'string' ? response : JSON.stringify(response);
      const { filtered, flagged } = filterAIResponse(stringResponse);

      const aiMessage: Message = {
        role: 'model',
        content: filtered,
        timestamp: Date.now(),
        isFlagged: flagged
      };

      setMessages(prev => [...prev, aiMessage]);

      if (flagged) {
        setSecurityWarning(lang === 'en'
          ? "Note: Some content was filtered for safety."
          : "ملاحظة: تم تنقيح بعض المحتوى لغرض الأمان.");
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: lang === 'en'
          ? "I apologize, but I encountered an error connecting to the knowledge base. Please try again."
          : "أعتذر، واجهت خطأ في الاتصال بقاعدة المعرفة. يرجى المحاولة مرة أخرى.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'model',
      content: lang === 'en'
        ? "Chat history cleared. How can I help you now?"
        : "تم مسح سجل المحادثة. كيف يمكنني مساعدتك الآن؟",
      timestamp: Date.now()
    }]);
    setSecurityWarning(null);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">

      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
              <div className="bg-emerald-400 w-3 h-3 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              Eco-Chemist AI
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 uppercase tracking-wider font-black">
                {lang === 'en' ? 'Online' : 'متصل'}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>{lang === 'en' ? 'Secure & Encrypted' : 'مؤمن ومشفر'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20 active:scale-95"
          title={lang === 'en' ? "Clear Chat" : "مسح المحادثة"}
        >
          <XCircle size={20} />
        </button>
      </div>

      {/* Security Warning */}
      {securityWarning && (
        <div className="relative z-20 bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 animate-fade-in">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-xs font-medium text-red-200">{securityWarning}</span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}
            style={{ animationDelay: `${idx * 0.05}ms` }}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user'
              ? 'bg-slate-700 text-slate-300'
              : 'bg-gradient-to-br from-emerald-500 to-blue-600 text-white'
              }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Message Bubble */}
            <div className={`relative max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
              ? 'bg-white/10 text-white rounded-tr-none border border-white/5'
              : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-emerald-500/10'
              }`}>
              {msg.isFlagged && (
                <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-2 uppercase tracking-wide">
                  <ShieldCheck size={12} />
                  {lang === 'en' ? 'Flagged Content' : 'محتوى منقح'}
                </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      return !inline ? (
                        <div className="relative group">
                          <pre className="options-scroll bg-black/30 p-3 rounded-lg border border-white/10 overflow-x-auto my-2">
                            <code {...props} className={className}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-xs" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {typeof msg.content === 'object' ? JSON.stringify(msg.content) : msg.content}
                </ReactMarkdown>
              </div>

              {/* Timestamp */}
              <div className={`text-[10px] mt-2 opacity-50 font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 animate-fade-in pl-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
              <Bot size={20} className="text-emerald-500/50" />
            </div>
            <div className="bg-slate-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5 relative z-10">
        <div className="relative flex items-end gap-2 bg-slate-800/50 p-2 rounded-[1.5rem] border-2 border-transparent focus-within:border-emerald-500/50 focus-within:bg-slate-800 transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'en' ? "Ask about any chemical reaction..." : "اسأل عن أي تفاعل كيميائي..."}
            className="flex-1 bg-transparent text-white placeholder-slate-400 px-4 py-3 min-h-[50px] outline-none rounded-xl resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 mb-0.5 mr-0.5"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-emerald-500" />
            {lang === 'en'
              ? "AI-powered responses. Verify critical safety info."
              : "ردود مدعومة بالذكاء الاصطناعي. تحقق من معلومات السلامة."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiTutor;