import React, { useState } from 'react';
import { analyzeReaction, getReactionTypeInfo } from '../../services/reactionEngine';
import { ReactionPrediction } from '../../types/studyLab.types';
import { Language } from '../../types';
import { FlaskConical, ArrowRight, AlertTriangle, Leaf, Zap, Droplet, Wind, RefreshCw, CheckCircle } from 'lucide-react';
import Latex from '../Latex';

interface Props {
    lang: Language;
}

const ReactionSimulator: React.FC<Props> = ({ lang }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<ReactionPrediction | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = () => {
        if (!input.trim()) return;
        setIsAnalyzing(true);

        // Simulate processing time for effect
        setTimeout(() => {
            const analysis = analyzeReaction(input);
            setResult(analysis);
            setIsAnalyzing(false);
        }, 800);
    };

    const getImpactColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">

            {/* Input Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-[2rem] opacity-30 group-hover:opacity-60 blur-lg transition duration-500"></div>
                <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 shadow-2xl">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-emerald-400 shadow-inner">
                        <FlaskConical size={24} />
                    </div>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder={lang === 'en' ? "Enter reaction (e.g., H2 + O2 -> H2O)" : "أدخل التفاعل (مثال: H2 + O2 -> H2O)"}
                        className="flex-1 bg-transparent text-xl md:text-2xl font-mono text-white placeholder-slate-500 px-4 py-4 outline-none lowercase selection:bg-emerald-500/30"
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={!input.trim() || isAnalyzing}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-4 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        {isAnalyzing ? (
                            <RefreshCw className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>{lang === 'en' ? 'Analyze' : 'تحليل'}</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
                <div className="mt-3 text-center">
                    <p className="text-xs text-slate-500 font-mono">
                        {lang === 'en' ? 'Try: CH4 + O2 -> CO2 + H2O' : 'جرب: CH4 + O2 -> CO2 + H2O'}
                    </p>
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">

                    {/* Main Reaction Card */}
                    <div className="md:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    {lang === 'en' ? 'Reaction Type' : 'نوع التفاعل'}
                                </span>
                                <h2 className="text-3xl font-black text-white leading-tight">
                                    {getReactionTypeInfo(result.type, lang).name}
                                </h2>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${result.isPossible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {result.isPossible
                                    ? (lang === 'en' ? 'Valid Reaction' : 'تفاعل صحيح')
                                    : (lang === 'en' ? 'Invalid' : 'غير صحيح')}
                            </div>
                        </div>

                        <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 mb-8 font-mono text-xl text-center shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
                            <Latex>{input}</Latex>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <CheckCircle size={18} className="text-blue-400" />
                                <span className="text-sm">{result.reasoning}</span>
                            </div>
                        </div>
                    </div>

                    {/* Environmental Impact Card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></div>

                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Leaf size={20} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest text-slate-300">
                                    {lang === 'en' ? 'Eco Impact' : 'الأثر البيئي'}
                                </span>
                            </div>

                            <div className="text-center mb-8">
                                <div className="text-6xl font-black text-white mb-2 filter drop-shadow-lg">
                                    {result.environmentalImpact.sustainabilityScore}
                                </div>
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getImpactColor(result.environmentalImpact.sustainabilityScore)}`}>
                                    {lang === 'en' ? 'Sustainability Score' : 'مؤشر الاستدامة'}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Wind size={14} /> CO₂</span>
                                    <span className="font-mono text-white">{result.environmentalImpact.co2Emissions} kg</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Zap size={14} /> Energy</span>
                                    <span className="font-mono text-white">{result.environmentalImpact.energyRequired} kJ</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Droplet size={14} /> Water</span>
                                    <span className="font-mono text-white">{result.environmentalImpact.waterUsage} L</span>
                                </div>
                            </div>
                        </div>

                        {result.environmentalImpact.risks.length > 0 && (
                            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-red-400 mb-1">
                                    <AlertTriangle size={14} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{lang === 'en' ? 'Risks' : 'مخاطر'}</span>
                                </div>
                                <ul className="list-disc list-inside text-xs text-red-200/80 space-y-1">
                                    {result.environmentalImpact.risks.map((risk, i) => (
                                        <li key={i}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Green Alternative (if any) */}
                    {result.greenAlternative && (
                        <div className="md:col-span-3 bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Leaf size={120} />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                            {lang === 'en' ? 'Green Alternative' : 'بديل أخضر'}
                                        </div>
                                        <span className="text-emerald-400 font-bold text-sm">
                                            +{result.greenAlternative.sustainabilityScore - result.environmentalImpact.sustainabilityScore} Score
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {lang === 'en' ? 'Sustainable Synthesis Path' : 'مسار تصنيع مستدام'}
                                    </h3>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xl">
                                        {lang === 'en'
                                            ? 'This reaction can be optimized using green chemistry principles to reduce waste and energy consumption.'
                                            : 'يمكن تحسين هذا التفاعل باستخدام مبادئ الكيمياء الخضراء لتقليل النفايات واستهلاك الطاقة.'}
                                    </p>

                                    <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-4 font-mono text-emerald-300 text-lg shadow-inner inline-block">
                                        <Latex>{result.greenAlternative.reaction.split('(')[0]}</Latex>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full md:w-auto min-w-[300px]">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                        <div className="text-2xl font-black text-white mb-1">
                                            {result.greenAlternative.comparisonMetrics.co2Reduction}%
                                        </div>
                                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                                            {lang === 'en' ? 'Less CO₂' : 'أقل CO₂'}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                                        <div className="text-2xl font-black text-white mb-1">
                                            {result.greenAlternative.comparisonMetrics.energySavings}%
                                        </div>
                                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                                            {lang === 'en' ? 'Energy Saved' : 'توفير طاقة'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 bg-slate-800/50 border border-white/5 p-4 rounded-2xl">
                                        <span className="text-xs text-slate-400 block mb-2 uppercase tracking-wide font-bold">
                                            {lang === 'en' ? 'Key Improvements' : 'تحسينات رئيسية'}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {result.greenAlternative.improvements.map((imp, i) => (
                                                <span key={i} className="text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300 border border-slate-600">
                                                    {imp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default ReactionSimulator;
