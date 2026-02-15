import React, { useState } from 'react';
import { balanceChemicalEquation } from '../../utils/chemistry';
import { smartSolveEquation } from '../../services/geminiService';
import { Language } from '../../types';
import Latex from '../Latex';
import { Scale, ArrowRight, RefreshCw, CheckCircle, AlertTriangle, Zap, Divide } from 'lucide-react';

interface Props {
    lang: Language;
    onBalance: (method: 'local' | 'ai') => void;
}

const EquationBalancer: React.FC<Props> = ({ lang, onBalance }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<{ text: string; method: 'local' | 'ai'; isError?: boolean } | null>(null);
    const [isBalancing, setIsBalancing] = useState(false);

    const handleBalance = async () => {
        if (!input.trim()) return;
        setIsBalancing(true);
        setResult(null);

        // Artificial delay for effect
        await new Promise(r => setTimeout(r, 600));

        try {
            const localResult = balanceChemicalEquation(input);
            const isLocalError = localResult.includes("Error") || localResult.includes("Could not");

            if (!isLocalError) {
                setResult({ text: localResult, method: 'local' });
                onBalance('local');
            } else {
                // Fallback to AI
                try {
                    const aiResult = await smartSolveEquation(input, lang);
                    if (aiResult) {
                        setResult({ text: aiResult, method: 'ai' });
                        onBalance('ai');
                    } else {
                        throw new Error('AI failed');
                    }
                } catch (e) {
                    setResult({
                        text: lang === 'en' ? "Could not balance equation." : "تعذر موازنة المعادلة.",
                        method: 'local',
                        isError: true
                    });
                }
            }
        } catch (err) {
            setResult({
                text: lang === 'en' ? "Invalid equation format." : "صيغة المعادلة غير صحيحة.",
                method: 'local',
                isError: true
            });
        } finally {
            setIsBalancing(false);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto space-y-8">

            {/* Input Area */}
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-3 flex items-center gap-4 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

                <div className="w-16 h-16 rounded-[2rem] bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Scale size={28} />
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBalance()}
                    placeholder={lang === 'en' ? "e.g. Fe + O2 -> Fe2O3" : "مثال: Fe + O2 -> Fe2O3"}
                    className="flex-1 bg-transparent text-2xl font-mono text-white placeholder-slate-600 outline-none h-full py-4 px-2"
                />

                <button
                    onClick={handleBalance}
                    disabled={!input.trim() || isBalancing}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] px-8 py-4 font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-600/20"
                >
                    {isBalancing ? <RefreshCw className="animate-spin" /> : <Divide size={24} />}
                    <span className="hidden md:inline">{lang === 'en' ? 'Balance' : 'موازنة'}</span>
                </button>
            </div>

            {/* Result Display */}
            {result && (
                <div className="animate-fade-in-up">
                    <div className={`
             rounded-[3rem] p-10 text-center relative overflow-hidden border
             ${result.isError
                            ? 'bg-red-900/20 border-red-500/30'
                            : 'bg-slate-900/80 border-blue-500/30 backdrop-blur-xl shadow-[0_0_60px_rgba(37,99,235,0.15)]'}
           `}>
                        {/* Background Glow */}
                        {!result.isError && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        )}

                        {result.isError ? (
                            <div className="flex flex-col items-center gap-4 text-red-300">
                                <AlertTriangle size={48} className="text-red-500 mb-2" />
                                <h3 className="text-2xl font-bold">{lang === 'en' ? 'Balancing Failed' : 'فشلت الموازنة'}</h3>
                                <p>{result.text}</p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6 flex items-center justify-center gap-2">
                                    {result.method === 'ai' ? <Zap size={14} /> : <CheckCircle size={14} />}
                                    {lang === 'en' ? 'Balanced Equation' : 'المعادلة الموزونة'}
                                </div>

                                <div className="text-4xl md:text-5xl font-mono text-white mb-8 leading-relaxed drop-shadow-lg">
                                    <Latex>{result.text}</Latex>
                                </div>

                                {result.method === 'ai' && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                                        <Zap size={12} />
                                        {lang === 'en' ? 'AI Powered Solution' : 'حل مدعوم بالذكاء الاصطناعي'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Examples Grid */}
            {!result && (
                <div className="grid md:grid-cols-3 gap-4 opacity-50 hover:opacity-100 transition-opacity">
                    {['H2 + O2 -> H2O', 'CH4 + O2 -> CO2 + H2O', 'Al + Fe2O3 -> Fe + Al2O3'].map((eq, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(eq)}
                            className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-sm transition text-left flex items-center justify-between group"
                        >
                            <span>{eq}</span>
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EquationBalancer;
