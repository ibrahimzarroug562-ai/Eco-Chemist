import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, ChevronDown, Shield, AlertTriangle } from 'lucide-react';
import { chatWithGreenTutor } from '../services/geminiService.ts';
import { ChatMessage, Language } from '../types.ts';
import Latex from './Latex.tsx';
import { sanitizeInput, detectPromptInjection, aiChatRateLimiter, filterAIResponse } from '../utils/security.ts';

interface Props {
  lang: Language;
}

const AiTutor: React.FC<Props> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Security Check 1: Sanitize input
    const sanitized = sanitizeInput(input);

    // Security Check 2: Detect prompt injection
    if (detectPromptInjection(sanitized)) {
      setSecurityWarning(
        lang === 'en'
          ? '⚠️ Suspicious input detected. Please ask chemistry-related questions only.'
          : '⚠️ تم اكتشاف إدخال مشبوه. يرجى طرح أسئلة متعلقة بالكيمياء فقط.'
      );
      setTimeout(() => setSecurityWarning(null), 5000);
      return;
    }

    // Security Check 3: Rate limiting
    if (!aiChatRateLimiter.isAllowed('user-session')) {
      setSecurityWarning(
        lang === 'en'
          ? '⚠️ Too many requests. Please wait a moment.'
          : '⚠️ طلبات كثيرة جداً. يرجى الانتظار قليلاً.'
      );
      setTimeout(() => setSecurityWarning(null), 5000);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: sanitized, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithGreenTutor(history, userMsg.text, lang);

      // Security Check 4: Filter AI response
      const { filtered, flagged } = filterAIResponse(response);

      if (flagged) {
        console.warn('AI response contained potentially unsafe content and was filtered');
      }

      setMessages(prev => [...prev, { role: 'model', text: filtered, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: lang === 'en' ? 'Sorry, an error occurred. Please try again.' : 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSecurityWarning(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-[0_0_20px_#10b981] flex items-center justify-center text-slate-900 z-[100] transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-700 text-white rotate-0' : 'bg-emerald-500 hover:bg-emerald-400'}`}
      >
        {isOpen ? <ChevronDown size={28} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-[90] overflow-hidden font-arabic animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Eco-Chemist Tutor</h3>
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <Shield size={12} />
                  {lang === 'en' ? 'Protected' : 'محمي'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700 transition"
                >
                  {lang === 'en' ? 'Clear' : 'مسح'}
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Security Warning */}
          {securityWarning && (
            <div className="bg-orange-900/30 border-b border-orange-500/20 p-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-400 shrink-0" />
              <span className="text-xs text-orange-300">{securityWarning}</span>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-sm mt-10 p-4">
                <Sparkles className="mx-auto mb-2 opacity-50" size={32} />
                <p className="mb-4">{lang === 'en' ? 'Ask me anything about chemistry equations, elements, or recycling!' : 'اسألني أي شيء عن المعادلات الكيميائية، العناصر، أو إعادة التدوير!'}</p>
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 flex items-center gap-2 justify-center">
                    <Shield size={14} className="text-emerald-500" />
                    <span>{lang === 'en' ? 'Safe & Moderated AI' : 'ذكاء اصطناعي آمن ومُراقب'}</span>
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-md ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}>
                  <Latex block={false}>{msg.text}</Latex>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl p-3 flex gap-1 border border-slate-700">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'en' ? "Type a message..." : "اكتب رسالة..."}
              maxLength={500}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiTutor;