import React, { useState } from 'react';
import { ELEMENTS } from '../constants.ts';
import { ElementData, Language } from '../types.ts';
import { X, Atom, Zap, Info, Layers, Activity } from 'lucide-react';
import Latex from './Latex.tsx';

interface Props {
  lang: Language;
}

const PeriodicTable: React.FC<Props> = ({ lang }) => {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);

  const categories = [
    { id: 'all', label: lang === 'en' ? 'All' : 'الكل', color: 'from-slate-700 to-slate-900', border: 'border-slate-500' },
    { id: 'alkali', label: lang === 'en' ? 'Alkali' : 'فلزات قلوية', color: 'from-red-500/20 to-red-900/40', border: 'border-red-500' },
    { id: 'alkaline', label: lang === 'en' ? 'Alkaline' : 'ترابية قلوية', color: 'from-orange-500/20 to-orange-900/40', border: 'border-orange-500' },
    { id: 'transition', label: lang === 'en' ? 'Transition' : 'عناصر انتقالية', color: 'from-yellow-500/20 to-yellow-900/40', border: 'border-yellow-500' },
    { id: 'noble', label: lang === 'en' ? 'Noble' : 'غازات نبيلة', color: 'from-purple-500/20 to-purple-900/40', border: 'border-purple-500' },
    { id: 'nonmetal', label: lang === 'en' ? 'Non-metal' : 'لا فلزات', color: 'from-blue-500/20 to-blue-900/40', border: 'border-blue-500' },
    { id: 'halogen', label: lang === 'en' ? 'Halogen' : 'هالوجينات', color: 'from-pink-500/20 to-pink-900/40', border: 'border-pink-500' },
    { id: 'metalloid', label: lang === 'en' ? 'Metalloid' : 'أشباه فلزات', color: 'from-emerald-500/20 to-emerald-900/40', border: 'border-emerald-500' },
  ];

  const getLocalizedCategory = (cat: string) => {
    const found = categories.find(c => c.id === cat);
    if (found) return found.label;
    if (lang === 'ar') {
      switch (cat) {
        case 'post-transition': return 'فلزات بعد انتقالية';
        case 'actinide': return 'أكتينيدات';
        case 'lanthanide': return 'لانثانيدات';
        default: return cat;
      }
    }
    return cat;
  };

  const getElementStyle = (category: string) => {
    switch (category) {
      case 'alkali': return 'border-red-500 text-red-400 bg-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'alkaline': return 'border-orange-500 text-orange-400 bg-orange-900/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
      case 'transition': return 'border-yellow-500 text-yellow-400 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 'noble': return 'border-purple-500 text-purple-400 bg-purple-900/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
      case 'nonmetal': return 'border-blue-500 text-blue-400 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'halogen': return 'border-pink-500 text-pink-400 bg-pink-900/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]';
      case 'metalloid': return 'border-emerald-500 text-emerald-400 bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'actinide': return 'border-rose-500 text-rose-400 bg-rose-900/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'lanthanide': return 'border-cyan-500 text-cyan-400 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]';
      default: return 'border-slate-600 text-slate-400 bg-slate-800/40';
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in relative z-10">

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border uppercase tracking-wider backdrop-blur-md ${filter === cat.id
                ? `bg-slate-900 ${cat.border} text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105 ring-1 ring-white/20`
                : 'bg-slate-900/40 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid Container */}
      <div className="overflow-x-auto pb-12 pt-4 px-4 scrollbar-hide flex justify-center perspective-[2000px]">
        <div
          className="grid grid-cols-[repeat(18,minmax(3.5rem,1fr))] gap-2 min-w-[1000px] p-8 rounded-[3rem] bg-slate-950/80 backdrop-blur-xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] transform-style-3d transition-transform duration-500"
          style={{ transform: selectedElement ? 'scale(0.95) rotateX(2deg)' : 'none' }}
        >
          {Array.from({ length: 9 }, (_, r) => r + 1).map(row => (
            Array.from({ length: 18 }, (_, c) => c + 1).map(col => {
              // Special handling for Actinides and Lanthanides placement
              let currentElement = ELEMENTS.find(e => e.row === row && e.col === col);

              // Spacers for visual gaps
              if (row === 8 && col === 3) return <div key={`spacer-${row}-${col}`} className="col-span-1" />;

              if (!currentElement) return <div key={`empty-${row}-${col}`} className="aspect-[4/5]" />;

              const isDimmed = filter !== 'all' && currentElement.category !== filter;
              const isHovered = hoveredElement?.number === currentElement.number;

              return (
                <button
                  key={currentElement.number}
                  onMouseEnter={() => setHoveredElement(currentElement)}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => setSelectedElement(currentElement)}
                  className={`
                    aspect-[4/5] rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all duration-300 relative group
                    ${getElementStyle(currentElement.category)}
                    ${isDimmed ? 'opacity-10 grayscale scale-90 blur-[1px]' : 'opacity-100'}
                    ${isHovered && !isDimmed ? 'scale-125 z-50 -translate-y-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] ring-2 ring-white' : ''}
                  `}
                >
                  <span className="text-[10px] self-start opacity-70 font-mono leading-none">{currentElement.number}</span>
                  <span className={`text-xl font-black leading-none ${isHovered ? 'animate-pulse' : ''}`}>{currentElement.symbol}</span>
                  <span className="text-[8px] truncate w-full text-center opacity-90 font-medium tracking-tight">
                    {lang === 'en' ? currentElement.name : currentElement.name_ar}
                  </span>

                  {/* Hover Info Tooltip */}
                  {isHovered && !isDimmed && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-2xl z-50 pointer-events-none animate-fade-in-up">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-black">{currentElement.mass} u</div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{currentElement.config.split(' ').pop()}</div>
                      </div>
                      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45 transform"></div>
                    </div>
                  )}
                </button>
              );
            })
          ))}
        </div>
      </div>

      {/* Detail Overlay */}
      {selectedElement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setSelectedElement(null)}></div>

          <div className="relative w-full max-w-4xl bg-slate-900/90 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-scale-in text-white overflow-hidden">

            {/* Background Glow */}
            <div className={`absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${getElementStyle(selectedElement.category).split(' ')[2]}`}></div>

            <button
              onClick={() => setSelectedElement(null)}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>

            <div className="grid md:grid-cols-2 gap-12 relative z-10">

              {/* Left Column: Visuals */}
              <div className="flex flex-col items-center justify-center space-y-8">
                <div className={`
                  w-48 h-48 md:w-64 md:h-64 rounded-[3rem] flex flex-col items-center justify-center border-4 relative 
                  ${getElementStyle(selectedElement.category).replace('shadow-[', 'shadow-[0_0_50px_')}
                  bg-slate-950/50 backdrop-blur-md
                `}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[3rem]"></div>
                  <span className="text-lg opacity-50 font-mono mb-2">{selectedElement.number}</span>
                  <span className="text-8xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 filter drop-shadow-lg">
                    {selectedElement.symbol}
                  </span>
                  <span className="text-sm opacity-50 mt-4 font-mono">{selectedElement.mass}</span>
                </div>

                <div className="flex gap-4">
                  <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center">
                    <Layers size={20} className="mb-2 text-blue-400" />
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Group</span>
                    <span className="text-xl font-bold">{selectedElement.col}</span>
                  </div>
                  <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center">
                    <Activity size={20} className="mb-2 text-emerald-400" />
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Period</span>
                    <span className="text-xl font-bold">{selectedElement.row}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Info */}
              <div className="space-y-8 flex flex-col justify-center">
                <div>
                  <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
                    {lang === 'en' ? selectedElement.name : selectedElement.name_ar}
                  </h2>
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <Atom size={14} className="mr-2 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      {getLocalizedCategory(selectedElement.category)}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="flex items-center gap-3 mb-3 text-blue-400">
                      <Zap size={18} />
                      <span className="text-xs uppercase font-black tracking-widest">{lang === 'en' ? 'Electron Config' : 'التوزيع الإلكتروني'}</span>
                    </div>
                    <div className="text-2xl font-mono text-white relative z-10">
                      <Latex>{selectedElement.config}</Latex>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                      <Info size={18} />
                      <span className="text-xs uppercase font-black tracking-widest">{lang === 'en' ? 'Description' : 'الوصف'}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-lg font-light">
                      {lang === 'en' ? selectedElement.summary : selectedElement.summary_ar}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;