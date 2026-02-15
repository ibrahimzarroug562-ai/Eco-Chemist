import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Language } from '../types';

interface Props {
    level: number;
    rank: string;
    lang: Language;
    onClose: () => void;
}

const LevelUpOverlay: React.FC<Props> = ({ level, rank, lang, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
        const audio = new Audio('/sounds/levelup.mp3'); // Placeholder for sound
        // audio.play().catch(e => console.log('Audio play failed', e)); 

        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

            <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 border-2 border-yellow-400/50 rounded-[3rem] p-8 md:p-12 text-center shadow-[0_0_100px_rgba(250,204,21,0.4)] animate-scale-in max-w-lg w-full overflow-hidden">

                {/* Confetti simulation with CSS (simplified) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float-up"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100 + 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: Math.random()
                            }}
                        ></div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce-slow border-4 border-white/20">
                        <Trophy size={64} className="text-white drop-shadow-md" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-2 drop-shadow-sm">
                        {lang === 'ar' ? 'مستوى جديد!' : 'LEVEL UP!'}
                    </h2>

                    <div className="text-6xl font-black text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        {level}
                    </div>

                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-yellow-300 font-bold tracking-widest uppercase mb-8">
                        <Star size={16} className="fill-yellow-300" />
                        <span>{rank}</span>
                        <Star size={16} className="fill-yellow-300" />
                    </div>

                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                        {lang === 'ar'
                            ? 'أحسنت! لقد اكتسبت قدرات كيميائية جديدة.'
                            : 'Outstanding work! You have unlocked new chemical capabilities.'}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-4 rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/30"
                    >
                        {lang === 'ar' ? 'استمر في التقدم' : 'Continue Progress'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpOverlay;
