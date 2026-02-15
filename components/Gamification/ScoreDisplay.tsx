import React, { useEffect, useState } from 'react';
import { MultiScore } from '../../types/gamification.types';
import { BookOpen, Leaf, Microscope, Trophy } from 'lucide-react';
import { Language } from '../../types';

interface ScoreDisplayProps {
    scores: MultiScore;
    level: number;
    rankTitle: string;
    lang: Language;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ scores, level, rankTitle, lang }) => {
    const [displayScores, setDisplayScores] = useState<MultiScore>({ KP: 0, EIP: 0, RC: 0, total: 0 });

    // Animated counter effect
    useEffect(() => {
        const duration = 1500; // ms
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const startScores = { ...displayScores };

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const ease = (t: number) => 1 - Math.pow(1 - t, 3); // Cubic ease out

            if (currentStep <= steps) {
                setDisplayScores({
                    KP: Math.round(startScores.KP + (scores.KP - startScores.KP) * ease(progress)),
                    EIP: Math.round(startScores.EIP + (scores.EIP - startScores.EIP) * ease(progress)),
                    RC: Math.round(startScores.RC + (scores.RC - startScores.RC) * ease(progress)),
                    total: Math.round(startScores.total + (scores.total - startScores.total) * ease(progress)),
                });
            } else {
                setDisplayScores(scores);
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [scores]);

    return (
        <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 relative overflow-hidden group">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Header Level & Rank */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-yellow-500/20">
                        {level}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                            {lang === 'en' ? 'Current Rank' : 'الرتبة الحالية'}
                        </div>
                        <div className="text-white font-bold text-lg flex items-center gap-2">
                            {rankTitle}
                            <Trophy size={16} className="text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Total Score Badge */}
                <div className="px-4 py-2 rounded-full bg-slate-800 border border-white/10 flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total</span>
                    <span className="text-white font-mono font-bold text-lg">{displayScores.total.toLocaleString()}</span>
                </div>
            </div>

            {/* 3-Column Stats Grid */}
            <div className="grid grid-cols-3 gap-4 relative z-10">

                {/* KP: Knowledge */}
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-blue-500/10 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
                            <BookOpen size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">KP</div>
                            <div className="text-2xl font-black text-white font-mono">{displayScores.KP.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500">{lang === 'en' ? 'Knowledge' : 'معرفة'}</div>
                        </div>
                    </div>
                </div>

                {/* EIP: Eco Impact (Featured) */}
                <div className="bg-emerald-900/20 rounded-2xl p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 animate-pulse-slow"></div>
                    <div className="flex flex-col items-center text-center gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1 ring-1 ring-emerald-500/30">
                            <Leaf size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">EIP</div>
                            <div className="text-2xl font-black text-white font-mono">{displayScores.EIP.toLocaleString()}</div>
                            <div className="text-[10px] text-emerald-500/70 font-medium">{lang === 'en' ? 'Eco Impact' : 'أثر بيئي'}</div>
                        </div>
                    </div>
                </div>

                {/* RC: Research */}
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-purple-500/10 hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-1">
                            <Microscope size={20} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">RC</div>
                            <div className="text-2xl font-black text-white font-mono">{displayScores.RC.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500">{lang === 'en' ? 'Research' : 'بحث'}</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Progress Bar (Visual Polish) */}
            <div className="mt-6">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">
                    <span>{lang === 'en' ? 'Next Rank Progress' : 'التقدم للرتبة التالية'}</span>
                    <span>75%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 w-3/4 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>
        </div>
    );
};

export default ScoreDisplay;
