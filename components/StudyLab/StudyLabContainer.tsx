import React, { useState } from 'react';
import { Language } from '../../types';
import ReactionSimulator from './ReactionSimulator';
import EquationBalancer from './EquationBalancer'; // Assume created
import PeriodicTable from '../PeriodicTable';
import { FlaskConical, Scale, Table2, Atom, GraduationCap, Sparkles } from 'lucide-react';

interface Props {
    lang: Language;
}

type Tab = 'simulator' | 'balancer' | 'periodic' | 'molecular';

const StudyLabContainer: React.FC<Props> = ({ lang }) => {
    const [activeTab, setActiveTab] = useState<Tab>('simulator');
    const [labMode, setLabMode] = useState(false); // Toggle darker/immersive mode

    const tabs = [
        { id: 'simulator', icon: FlaskConical, label: lang === 'en' ? 'Reaction Lab' : 'مختبر التفاعلات', color: 'text-emerald-400' },
        { id: 'balancer', icon: Scale, label: lang === 'en' ? 'Balancer' : 'موازنة المعادلات', color: 'text-blue-400' },
        { id: 'periodic', icon: Table2, label: lang === 'en' ? 'Elements' : 'الجدول الدوري', color: 'text-purple-400' },
        { id: 'molecular', icon: Atom, label: lang === 'en' ? 'Molecules' : 'الجزيئات', color: 'text-pink-400', disabled: true },
    ];

    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-700 ${labMode ? 'bg-black' : 'bg-transparent'}`}>

            {/* Immersive Header */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 mb-2">
                        {lang === 'en' ? 'Advanced Study Lab' : 'مختبر الدراسة المتقدم'}
                    </h1>
                    <p className="text-slate-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400" />
                        {lang === 'en' ? 'AI-Powered Chemical Research Facility' : 'منشأة أبحاث كيميائية مدعومة بالذكاء الاصطناعي'}
                    </p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && setActiveTab(tab.id as Tab)}
                            disabled={tab.disabled}
                            className={`
                px-6 py-3 rounded-xl flex items-center gap-3 transition-all relative overflow-hidden group
                ${activeTab === tab.id
                                    ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
                        >
                            {activeTab === tab.id && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color.replace('text-', 'from-')}/10 to-transparent opacity-50`}></div>
                            )}

                            <tab.icon size={20} className={`${activeTab === tab.id ? tab.color : 'group-hover:text-white transition-colors'}`} />
                            <span className="font-bold text-sm tracking-wide">{tab.label}</span>

                            {activeTab === tab.id && (
                                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${tab.color.replace('text-', 'from-')} to-transparent`}></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto relative min-h-[600px]">
                {/* Background Ambience */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

                <div className="relative z-10 transition-all duration-500 transform">
                    {activeTab === 'simulator' && <ReactionSimulator lang={lang} />}
                    {activeTab === 'balancer' && <EquationBalancer lang={lang} onBalance={() => { }} />}
                    {activeTab === 'periodic' && <PeriodicTable lang={lang} />}
                </div>
            </div>

        </div>
    );
};

export default StudyLabContainer;
