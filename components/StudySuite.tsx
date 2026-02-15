import React, { useState, useRef } from 'react';
import { balanceChemicalEquation } from '../utils/chemistry.ts';
import { getLewisStructure, smartSolveEquation } from '../services/geminiService.ts';
import { Language } from '../types.ts';
import Latex from './Latex.tsx';
import { ArrowRight, Zap, Search, Atom, Sparkles, AlertCircle, Plus, Minus, RotateCcw, Grid3X3, BookOpen, Lightbulb } from 'lucide-react';
import { validateChemicalFormula, validateMolecularFormula } from '../utils/security.ts';

interface Props {
  lang: Language;
  onBalance: () => void;
}

const InteractiveSVGViewer: React.FC<{ svgContent: string }> = ({ svgContent }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={() => setScale(s => Math.min(s + 0.5, 4))} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 hover:bg-slate-800 transition"><Plus size={16} /></button>
        <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 hover:bg-slate-800 transition"><Minus size={16} /></button>
        <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 hover:bg-slate-800 transition"><RotateCcw size={16} /></button>
      </div>
      <div className="w-full h-full cursor-move" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: 'center' }} className="w-full h-full flex items-center justify-center p-8 pointer-events-none [&>svg]:pointer-events-auto" dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>
    </div>
  );
};

const StudySuite: React.FC<Props> = ({ lang, onBalance }) => {
  const [activeTab, setActiveTab] = useState<'balancer' | 'lewis'>('balancer');
  const [inputEq, setInputEq] = useState('');
  const [balancedEq, setBalancedEq] = useState<{ text: string, method: 'local' | 'ai', error?: boolean } | null>(null);
  const [isBalancing, setIsBalancing] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [lewisInput, setLewisInput] = useState('');
  const [lewisData, setLewisData] = useState<any | null>(null);
  const [lewisLoading, setLewisLoading] = useState(false);

  const handleBalance = async () => {
    if (!inputEq.trim()) return;

    // Security: Validate chemical formula
    if (!validateChemicalFormula(inputEq)) {
      setBalancedEq({
        text: lang === 'en' ? "Invalid formula format." : "صيغة غير صحيحة.",
        method: 'local',
        error: true
      });
      return;
    }

    setIsBalancing(true);
    setBalancedEq(null);
    setShowSteps(false);
    const localResult = balanceChemicalEquation(inputEq);
    const isLocalError = localResult.includes("Error") || localResult.includes("Could not") || localResult.includes("Invalid");
    if (!isLocalError) {
      setBalancedEq({ text: localResult, method: 'local' });
      onBalance(); // XP reward
      setIsBalancing(false);
    } else {
      try {
        const aiResult = await smartSolveEquation(inputEq, lang);
        if (aiResult) {
          setBalancedEq({ text: aiResult, method: 'ai' });
          onBalance(); // XP reward
        } else {
          setBalancedEq({ text: lang === 'en' ? "Failed to balance." : "فشل الموازنة.", method: 'local', error: true });
        }
      } finally { setIsBalancing(false); }
    }
  };

  const handleLewisSearch = async () => {
    if (!lewisInput) return;

    // Security: Validate molecular formula
    if (!validateMolecularFormula(lewisInput)) {
      setLewisData({
        svg: '<svg></svg>',
        geometry: 'Invalid',
        hybridization: 'N/A',
        details: lang === 'en'
          ? 'Invalid molecular formula. Use only letters and numbers (e.g., H2O, NH3).'
          : 'صيغة جزيئية غير صالحة. استخدم الحروف والأرقام فقط (مثل H2O, NH3).'
      });
      return;
    }

    setLewisLoading(true);
    setLewisData(null);
    const result = await getLewisStructure(lewisInput, lang);
    setLewisData(result);
    setLewisLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button onClick={() => setActiveTab('balancer')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'balancer' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>
          {lang === 'en' ? 'Equation Balancer' : 'موازن المعادلات'}
        </button>
        <button onClick={() => setActiveTab('lewis')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${activeTab === 'lewis' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>
          {lang === 'en' ? 'Lewis Structures' : 'تراكيب لويس'}
        </button>
      </div>

      {activeTab === 'balancer' ? (
        <div className="animate-fade-in space-y-4">
          {/* Input Section */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[60px]">
              {inputEq ? <Latex>{inputEq.replace('->', '\\rightarrow')}</Latex> : <span className="text-slate-700 italic">Preview...</span>}
            </div>
            <div className="flex gap-2">
              <input type="text" value={inputEq} onChange={e => setInputEq(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBalance()} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition font-mono" placeholder="Al + O2 -> Al2O3" />
              <button onClick={handleBalance} disabled={isBalancing} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 rounded-xl transition disabled:opacity-50">
                {isBalancing ? <Zap className="animate-spin" /> : <ArrowRight size={24} />}
              </button>
            </div>
          </div>

          {/* Result Section */}
          {balancedEq && (
            <>
              <div className={`p-8 rounded-3xl text-center shadow-xl border animate-fade-in ${balancedEq.error ? 'bg-red-900/10 border-red-500/20' : 'bg-slate-900 border-emerald-500/30'}`}>
                {balancedEq.method === 'ai' && <div className="text-[10px] text-purple-400 uppercase font-bold mb-2 flex items-center justify-center gap-1"><Sparkles size={10} /> AI Balanced</div>}
                <div className="text-2xl sm:text-3xl text-white">
                  {balancedEq.error ? balancedEq.text : <Latex>{balancedEq.text}</Latex>}
                </div>
                {!balancedEq.error && balancedEq.method === 'local' && (
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="mt-6 px-6 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition flex items-center gap-2 mx-auto"
                  >
                    <Grid3X3 size={16} />
                    {showSteps ? (lang === 'en' ? 'Hide Matrix Method' : 'إخفاء طريقة المصفوفة') : (lang === 'en' ? 'Show Matrix Method' : 'عرض طريقة المصفوفة')}
                  </button>
                )}
              </div>

              {/* Matrix Method Explanation */}
              {showSteps && !balancedEq.error && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 animate-fade-in space-y-6">
                  <div className="flex items-center gap-3 text-blue-400 mb-6">
                    <BookOpen size={24} />
                    <h3 className="text-xl font-black">{lang === 'en' ? 'Matrix Balancing Method' : 'طريقة المصفوفة لموازنة المعادلات'}</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-emerald-400 mb-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center font-black">1</div>
                        <span className="font-bold">{lang === 'en' ? 'Setup Element Matrix' : 'إنشاء مصفوفة العناصر'}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {lang === 'en'
                          ? 'Each row represents an element, each column represents a molecule. Reactants are positive, products are negative.'
                          : 'كل صف يمثل عنصر، كل عمود يمثل جزيء. المتفاعلات موجبة، والنواتج سالبة.'}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-blue-400 mb-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center font-black">2</div>
                        <span className="font-bold">{lang === 'en' ? 'Gaussian Elimination (RREF)' : 'طريقة الحذف الغاوسي'}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {lang === 'en'
                          ? 'Convert the matrix to Reduced Row Echelon Form through row operations: row swapping, row multiplication, and row addition/subtraction.'
                          : 'تحويل المصفوفة إلى الشكل المختزل من خلال عمليات صفية: تبديل الصفوف، ضرب الصف، وجمع/طرح الصفوف.'}
                      </p>
                      <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                        <code className="text-xs text-emerald-400 font-mono">
                          {lang === 'en' ? 'Row₁ = Row₁ / pivot₁' : 'الصف₁ = الصف₁ / العنصر المحوري₁'}
                          <br />
                          {lang === 'en' ? 'Rowᵢ = Rowᵢ - (multiplier × Row₁)' : 'الصفᵢ = الصفᵢ - (المضاعف × الصف₁)'}
                        </code>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-purple-400 mb-3">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center font-black">3</div>
                        <span className="font-bold">{lang === 'en' ? 'Back Substitution' : 'التعويض العكسي'}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {lang === 'en'
                          ? 'Set free variables and solve for coefficients through back substitution, then normalize to smallest whole numbers.'
                          : 'تعيين المتغيرات الحرة وحل المعاملات عبر التعويض العكسي، ثم التطبيع إلى أصغر أعداد صحيحة.'}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-emerald-400 mb-3">
                        <Lightbulb size={20} />
                        <span className="font-bold">{lang === 'en' ? 'Result Verification' : 'التحقق من النتيجة'}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {lang === 'en'
                          ? 'The system ensures atom conservation: total atoms on left = total atoms on right for each element.'
                          : 'النظام يضمن حفظ الذرات: إجمالي الذرات على اليسار = إجمالي الذرات على اليمين لكل عنصر.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                    <p className="text-xs text-blue-300 text-center font-medium">
                      💡 {lang === 'en'
                        ? 'This method works for complex equations where traditional trial-and-error fails!'
                        : 'هذه الطريقة تعمل مع المعادلات المعقدة حيث تفشل طريقة المحاولة والخطأ التقليدية!'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex gap-2">
            <input type="text" value={lewisInput} onChange={e => setLewisInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLewisSearch()} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition" placeholder="e.g. NH3, H2O, CH4" />
            <button onClick={handleLewisSearch} disabled={lewisLoading} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 rounded-xl transition">
              {lewisLoading ? <Zap className="animate-spin" /> : <Search size={24} />}
            </button>
          </div>
          {lewisData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveSVGViewer svgContent={lewisData.svg} />
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-4"><Atom /> <h3 className="font-bold">Structure Analysis</h3></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800"><span className="text-[10px] text-slate-500 block">Geometry</span><span className="font-bold text-emerald-400">{lewisData.geometry}</span></div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800"><span className="text-[10px] text-slate-500 block">Hybrid</span><span className="font-bold text-blue-400">{lewisData.hybridization}</span></div>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-arabic">
                  {lewisData.details}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudySuite;