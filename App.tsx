import React, { useState, useEffect } from 'react';
import { Beaker, ScanLine, BookOpen, ChevronLeft, Home, LogOut, User, Trophy, Star, Target, Zap, Loader2, Leaf } from 'lucide-react';
import Scanner from './components/Scanner.tsx';
import PeriodicTable from './components/PeriodicTable.tsx';
import StudySuite from './components/StudySuite.tsx';
import AiTutor from './components/AiTutor.tsx';
import Auth from './components/Auth.tsx';
import { subscribeToAuthChanges, logout } from './services/firebase.ts';
import { Language, UserStats, UserProfile } from './types.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'scanner' | 'table' | 'study'>('home');
  const [lang, setLang] = useState<Language>('ar');
  const [stats, setStats] = useState<UserStats>({
    rank: 'Junior Chemist',
    rank_ar: 'مساعد مخبري',
    points: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    scans: 0,
    equationsBalanced: 0,
    co2Saved: 0,
    plasticsIdentified: 0,
    recyclingStreak: 0
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'كيميائي المستقبل',
          email: firebaseUser.email || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (stats.xp >= stats.nextLevelXp) {
      setStats(prev => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - prev.nextLevelXp,
        nextLevelXp: Math.floor(prev.nextLevelXp * 1.6),
        rank: prev.level + 1 > 5 ? 'Senior Alchemist' : 'Researcher',
        rank_ar: prev.level + 1 > 5 ? 'عالم كيميائي محترف' : 'باحث كيميائي'
      }));
    }
  }, [stats.xp]);

  const addXp = (amount: number) => {
    setStats(prev => ({ ...prev, xp: prev.xp + amount, points: prev.points + amount }));
  };

  const handleLogout = async () => {
    await logout();
    setActiveView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <span className="text-emerald-500 font-black tracking-widest uppercase text-xs">Initializing Lab...</span>
      </div>
    );
  }

  if (!user) {
    return <Auth lang={lang} />;
  }

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-200 pb-28 font-sans ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-4 flex justify-between items-center bg-slate-900/30 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          {activeView !== 'home' && (
            <button onClick={() => setActiveView('home')} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all">
              <ChevronLeft size={20} className={lang === 'ar' ? '' : 'rotate-180'} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-tight">
              {activeView === 'home' ? 'Eco-Chemist' : (lang === 'en' ? 'Laboratory' : 'المختبر الذكي')}
            </h1>
            {activeView === 'home' && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{stats.rank_ar}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} className="px-4 py-1.5 flex items-center justify-center bg-slate-800/50 rounded-full border border-white/5 text-[10px] font-black text-emerald-400 hover:border-emerald-500/30 transition-all">
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          <div className="group relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer">
              <User size={20} className="text-slate-950" />
            </div>
            <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl p-2 hidden group-hover:block animate-fade-in shadow-2xl min-w-[150px]">
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold"
              >
                <LogOut size={16} /> {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-5">
        {activeView === 'home' && (
          <div className="space-y-8 animate-fade-in">
            {/* Professional Dashboard */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/30 to-blue-600/30 rounded-[2.5rem] blur opacity-20 transition duration-1000"></div>
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900/60 border border-white/5 p-8 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="md:col-span-2 space-y-6 text-right">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Trophy size={18} /></div>
                    <h2 className="text-2xl font-black text-white">{lang === 'ar' ? 'التقدم الحالي' : 'Progress Dashboard'}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">المستوى</span>
                      <span className="text-3xl font-black text-emerald-400">{stats.level}</span>
                    </div>
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">الرتبة</span>
                      <span className="text-sm font-black text-white leading-tight mt-1 inline-block">{stats.rank_ar}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                      <span>XP: {stats.xp}</span>
                      <span>الهدف: {stats.nextLevelXp}</span>
                    </div>
                    <div className="h-4 bg-slate-950 rounded-full border border-white/5 overflow-hidden p-1">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-emerald-500/5 rounded-3xl p-6 border border-emerald-500/10">
                  <Star size={48} className="text-yellow-400 mb-4 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">إجمالي النقاط</span>
                  <span className="text-5xl font-black text-white my-2 tracking-tighter">{stats.points}</span>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2.5 h-1.5 rounded-full transition-all duration-500 ${i <= stats.level ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-800'}`}></div>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Impact Analytics */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-[2.5rem] blur opacity-20"></div>
              <div className="relative bg-slate-900/60 border border-green-500/20 p-8 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Leaf size={18} /></div>
                  <h2 className="text-2xl font-black text-white">{lang === 'ar' ? 'الأثر البيئي' : 'Environmental Impact'}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CO2 Saved */}
                  <div className="bg-green-950/40 p-6 rounded-2xl border border-green-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-green-500/10 transform rotate-12">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="40" />
                      </svg>
                    </div>
                    <div className="relative">
                      <span className="text-[10px] text-green-400 font-bold uppercase block mb-2">{lang === 'ar' ? 'ثاني أكسيد الكربون المُوفر' : 'CO₂ Saved'}</span>
                      <span className="text-4xl font-black text-green-400">{(stats.co2Saved || 0).toFixed(1)}</span>
                      <span className="text-sm text-slate-400 block mt-1">kg</span>
                    </div>
                  </div>

                  {/* Plastics Identified */}
                  <div className="bg-blue-950/40 p-6 rounded-2xl border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-blue-500/10">
                      <Target size={80} />
                    </div>
                    <div className="relative">
                      <span className="text-[10px] text-blue-400 font-bold uppercase block mb-2">{lang === 'ar' ? 'البلاستيك المُحدد' : 'Plastics Identified'}</span>
                      <span className="text-4xl font-black text-blue-400">{stats.plasticsIdentified || 0}</span>
                      <span className="text-sm text-slate-400 block mt-1">{lang === 'ar' ? 'عينة' : 'samples'}</span>
                    </div>
                  </div>

                  {/* Recycling Streak */}
                  <div className="bg-purple-950/40 p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-purple-500/10">
                      <Zap size={80} />
                    </div>
                    <div className="relative">
                      <span className="text-[10px] text-purple-400 font-bold uppercase block mb-2">{lang === 'ar' ? 'سلسلة النشاط' : 'Activity Streak'}</span>
                      <span className="text-4xl font-black text-purple-400">{stats.recyclingStreak || 0}</span>
                      <span className="text-sm text-slate-400 block mt-1">{lang === 'ar' ? 'يوم' : 'days'}</span>
                    </div>
                  </div>
                </div>

                {/* Impact Message */}
                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <p className="text-sm text-emerald-300 text-center font-medium">
                    🌍 {lang === 'ar'
                      ? `كل عملية فحص تساهم في بيئة أنظف! استمر في العمل الرائع.`
                      : `Every scan contributes to a cleaner environment! Keep up the great work.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <button onClick={() => setActiveView('scanner')} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800 transition-all group relative overflow-hidden backdrop-blur-md text-right">
                <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><ScanLine size={80} /></div>
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg mr-auto sm:mr-0">
                  <ScanLine size={28} />
                </div>
                <h4 className="font-black text-xl text-white mb-2">{lang === 'ar' ? 'ماسح البلاستيك' : 'Plastic Scanner'}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">حدد أنواع البوليمرات فوراً باستخدام الكاميرا والذكاء الاصطناعي.</p>
              </button>

              <button onClick={() => setActiveView('table')} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800 transition-all group relative overflow-hidden backdrop-blur-md text-right">
                <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><BookOpen size={80} /></div>
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg mr-auto sm:mr-0">
                  <BookOpen size={28} />
                </div>
                <h4 className="font-black text-xl text-white mb-2">{lang === 'ar' ? 'الجدول الدوري' : 'Periodic Table'}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">دليل تفاعلي شامل للعناصر، خصائصها وتوزيعها الإلكتروني.</p>
              </button>

              <button onClick={() => setActiveView('study')} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800 transition-all group relative overflow-hidden sm:col-span-2 lg:col-span-1 backdrop-blur-md text-right">
                <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:scale-150 transition-transform"><Beaker size={80} /></div>
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg mr-auto sm:mr-0">
                  <Beaker size={28} />
                </div>
                <h4 className="font-black text-xl text-white mb-2">{lang === 'ar' ? 'مختبر الدراسة' : 'Study Lab'}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">حل المعادلات الكيميائية ورسم تراكيب لويس الجزيئية بدقة عالية.</p>
              </button>
            </div>
          </div>
        )}

        {activeView === 'scanner' && <Scanner lang={lang} onScanComplete={() => {
          addXp(50);
          setStats(prev => ({
            ...prev,
            scans: prev.scans + 1,
            plasticsIdentified: (prev.plasticsIdentified || 0) + 1,
            co2Saved: (prev.co2Saved || 0) + 0.5 // Estimate 0.5kg CO2 saved per scan/recycling action
          }));
        }} />}
        {activeView === 'table' && <PeriodicTable lang={lang} />}
        {activeView === 'study' && <StudySuite lang={lang} onBalance={() => addXp(40)} />}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-3xl border border-white/5 px-6 py-4 rounded-[2.5rem] flex items-center gap-4 z-[100] shadow-2xl">
        <button onClick={() => setActiveView('home')} className={`p-4 rounded-2xl transition-all flex items-center gap-2 ${activeView === 'home' ? 'text-emerald-400 bg-emerald-500/10 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <Home size={22} />
          {activeView === 'home' && <span className="text-xs font-black">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>}
        </button>
        <button onClick={() => setActiveView('scanner')} className={`p-4 rounded-2xl transition-all flex items-center gap-2 ${activeView === 'scanner' ? 'text-emerald-400 bg-emerald-500/10 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <ScanLine size={22} />
          {activeView === 'scanner' && <span className="text-xs font-black">{lang === 'ar' ? 'الماسح' : 'Scanner'}</span>}
        </button>
        <button onClick={() => setActiveView('table')} className={`p-4 rounded-2xl transition-all flex items-center gap-2 ${activeView === 'table' ? 'text-emerald-400 bg-emerald-500/10 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <BookOpen size={22} />
          {activeView === 'table' && <span className="text-xs font-black">{lang === 'ar' ? 'الجدول' : 'Table'}</span>}
        </button>
        <button onClick={() => setActiveView('study')} className={`p-4 rounded-2xl transition-all flex items-center gap-2 ${activeView === 'study' ? 'text-emerald-400 bg-emerald-500/10 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <Beaker size={22} />
          {activeView === 'study' && <span className="text-xs font-black">{lang === 'ar' ? 'المختبر' : 'Lab'}</span>}
        </button>
      </nav>

      <AiTutor lang={lang} />
    </div>
  );
};

export default App;