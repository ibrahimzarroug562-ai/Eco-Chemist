import React, { useState } from 'react';
import { ELEMENTS } from '../constants.ts';
import { ElementData, Language } from '../types.ts';
import { X, Atom, Zap, Info } from 'lucide-react';
import Latex from './Latex.tsx';

interface Props {
  lang: Language;
}

const PeriodicTable: React.FC<Props> = ({ lang }) => {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: lang === 'en' ? 'All' : 'الكل', color: 'bg-slate-700' },
    { id: 'alkali', label: lang === 'en' ? 'Alkali' : 'فلزات قلوية', color: 'bg-red-500' },
    { id: 'alkaline', label: lang === 'en' ? 'Alkaline' : 'ترابية قلوية', color: 'bg-orange-500' },
    { id: 'transition', label: lang === 'en' ? 'Transition' : 'عناصر انتقالية', color: 'bg-yellow-500' },
    { id: 'noble', label: lang === 'en' ? 'Noble' : 'غازات نبيلة', color: 'bg-purple-500' },
    { id: 'nonmetal', label: lang === 'en' ? 'Non-metal' : 'لا فلزات', color: 'bg-blue-500' },
    { id: 'halogen', label: lang === 'en' ? 'Halogen' : 'هالوجينات', color: 'bg-pink-500' },
    { id: 'metalloid', label: lang === 'en' ? 'Metalloid' : 'أشباه فلزات', color: 'bg-emerald-500' },
  ];

  const getLocalizedCategory = (cat: string) => {
    const found = categories.find(c => c.id === cat);
    if (found) return found.label;
    
    // Fallbacks for categories not in the main filter list
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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'alkali': return 'border-red-500/50 text-red-400 bg-red-900/10';
      case 'alkaline': return 'border-orange-500/50 text-orange-400 bg-orange-900/10';
      case 'transition': return 'border-yellow-500/50 text-yellow-400 bg-yellow-900/10';
      case 'noble': return 'border-purple-500/50 text-purple-400 bg-purple-900/10';
      case 'nonmetal': return 'border-blue-500/50 text-blue-400 bg-blue-900/10';
      case 'halogen': return 'border-pink-500/50 text-pink-400 bg-pink-900/10';
      case 'metalloid': return 'border-emerald-500/50 text-emerald-400 bg-emerald-900/10';
      default: return 'border-slate-700 text-slate-400 bg-slate-900/50';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${filter === cat.id ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto pb-6 scrollbar-hide flex justify-center">
        <div className="grid grid-cols-18 gap-1 min-w-[900px] bg-slate-950 p-2 rounded-3xl border border-slate-900 shadow-inner">
          {Array.from({ length: 9 }, (_, r) => r + 1).map(row => (
            Array.from({ length: 18 }, (_, c) => c + 1).map(col => {
              const el = ELEMENTS.find(e => e.row === row && e.col === col);
              if (!el) return <div key={`empty-${row}-${col}`} className="w-12 h-14" />;
              
              const isDimmed = filter !== 'all' && el.category !== filter;

              return (
                <button
                  key={el.number}
                  onClick={() => setSelectedElement(el)}
                  className={`w-12 h-14 rounded-lg border flex flex-col items-center justify-between p-1 transition-all group ${getCategoryColor(el.category)} ${isDimmed ? 'opacity-20 scale-90 blur-[1px]' : 'hover:scale-125 hover:z-50 hover:shadow-2xl hover:border-white'}`}
                >
                  <span className="text-[8px] self-start opacity-60 font-mono leading-none">{el.number}</span>
                  <span className="text-sm font-bold leading-none">{el.symbol}</span>
                  <span className="text-[6px] truncate w-full text-center opacity-80 uppercase tracking-tighter">{lang === 'en' ? el.name : el.name_ar}</span>
                </button>
              );
            })
          ))}
        </div>
      </div>

      {selectedElement && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getCategoryColor(selectedElement.category).split(' ')[0].replace('border-', 'bg-')}`}></div>
            
            <button onClick={() => setSelectedElement(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-2">
              <X size={24} />
            </button>

            <div className="flex items-center gap-6 mb-8">
              <div className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center border-2 ${getCategoryColor(selectedElement.category)}`}>
                <span className="text-xs opacity-60">{selectedElement.number}</span>
                <span className="text-4xl font-black">{selectedElement.symbol}</span>
                <span className="text-[10px] opacity-60">{selectedElement.mass}</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold">{lang === 'en' ? selectedElement.name : selectedElement.name_ar}</h3>
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{getLocalizedCategory(selectedElement.category)}</span>
              </div>
            </div>

            <div className="space-y-4">
               <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Zap size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">{lang === 'en' ? 'Configuration' : 'التوزيع الإلكتروني'}</span>
                  </div>
                  <div className="text-xl font-mono text-blue-400">
                    <Latex>{selectedElement.config}</Latex>
                  </div>
               </div>
               <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'Summary' : 'ملخص'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-arabic">
                    {lang === 'en' ? selectedElement.summary : selectedElement.summary_ar}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodicTable;