import React, { useState, useEffect } from 'react';
import { Beaker, ScanLine, ChevronLeft, Home, LogOut, User, Trophy, Star, Target, Zap, Loader2, Leaf, Atom } from 'lucide-react';
import Scanner from './components/Scanner';
import StudyLabContainer from './components/StudyLab/StudyLabContainer';
import AiTutor from './components/AiTutor';
import ScoreDisplay from './components/Gamification/ScoreDisplay';
import Auth from './components/Auth';
import MolecularBackground from './components/MolecularBackground';
import LevelUpOverlay from './components/LevelUpOverlay';
import { subscribeToAuthChanges, logout } from './services/firebase';
import { Language, UserStats, UserProfile } from './types';
import { MultiScore } from './types/gamification.types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'home' | 'scanner' | 'lab'>('home');
  const [lang, setLang] = useState<Language>('ar');
  const [showLevelUp, setShowLevelUp] = useState(false);
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

  // Calculate MultiScores from legacy stats for UI compatibility
  const multiScores: MultiScore = {
    KP: stats.xp + (stats.equationsBalanced * 50),
    EIP: (stats.co2Saved * 10) + (stats.plasticsIdentified * 20),
    RC: stats.equationsBalanced * 15,
    total: stats.points
  };

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
      setShowLevelUp(true);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <MolecularBackground />
        <Loader2 className="animate-spin text-emerald-500 relative z-10" size={48} />
        <span className="text-emerald-500 font-black tracking-widest uppercase text-xs relative z-10">Initializing Lab...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <MolecularBackground />
        <Auth lang={lang} />
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-200 pb-28 font-sans ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Immersive Background */}
      <MolecularBackground />

      {/* Dynamic Overlay Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-950/90"></div>

      {showLevelUp && (
        <LevelUpOverlay
          level={stats.level}
          rank={lang === 'en' ? stats.rank : stats.rank_ar}
          lang={lang}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      <header className="p-4 flex justify-between items-center bg-slate-900/30 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4">
          {activeView !== 'home' && (
            <button onClick={() => setActiveView('home')} className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all border border-white/5 active:scale-95 text-slate-400 hover:text-white">
              <ChevronLeft size={20} className={lang === 'ar' ? '' : 'rotate-180'} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2 drop-shadow-md">
              <Atom className="text-emerald-500 animate-spin-slow" size={20} />
              {activeView === 'home' ? 'Eco-Chemist' : (lang === 'en' ? 'Laboratory' : 'المختبر الذكي')}
            </h1>
            {activeView === 'home' && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider pl-7 drop-shadow-sm">{stats.rank_ar}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} className="px-4 py-1.5 flex items-center justify-center bg-slate-800/50 rounded-full border border-white/5 text-[10px] font-black text-emerald-400 hover:border-emerald-500/30 transition-all hover:bg-slate-800 hover:shadow-glow">
            {lang === 'en' ? 'AR' : 'EN'}
          </button>

          <div className="relative group p-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer transform transition group-hover:scale-110 active:scale-95 duration-300 hover:shadow-cyan-500/50">
              <span className="font-bold text-white uppercase drop-shadow-md">{user.name.charAt(0)}</span>
            </div>
            <button
              onClick={handleLogout}
              className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-red-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto whitespace-nowrap shadow-xl z-[150]"
            >
              {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 relative z-10 w-full animate-fade-in">
        {activeView === 'home' && (
          <div className="space-y-8 animate-fade-in-up">

            {/* New Gamification Dashboard */}
            <div className="transform hover:scale-[1.01] transition-transform duration-500">
              <ScoreDisplay
                scores={multiScores}
                level={stats.level}
                rankTitle={lang === 'en' ? stats.rank : stats.rank_ar}
                lang={lang}
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Scanner Card */}
              <button
                onClick={() => setActiveView('scanner')}
                className="group relative bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col justify-between h-[280px] overflow-hidden text-right backdrop-blur-md"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-emerald-500/40 transition-colors duration-500 animate-pulse-slow"></div>
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ScanLine size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">{lang === 'ar' ? 'ماسح البوليمر' : 'Polymer Scanner'}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                    {lang === 'ar' ? 'تعرف على أنواع البلاستيك بالذكاء الاصطناعي' : 'Identify plastics instantly using AI vision'}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all pt-4">
                    <span>{lang === 'ar' ? 'ابدأ المسح' : 'Start Scan'}</span>
                    <ChevronLeft size={16} className="rotate-180 group-hover:text-white" />
                  </div>
                </div>
              </button>

              {/* Study Lab Card */}
              <button
                onClick={() => setActiveView('lab')}
                className="group relative bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col justify-between h-[280px] overflow-hidden md:col-span-2 lg:col-span-1 text-right backdrop-blur-md"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px] -mr-10 -mt-10 group-hover:bg-blue-500/40 transition-colors duration-500 animate-pulse-slow"></div>
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <Beaker size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{lang === 'ar' ? 'المختبر الذكي' : 'Smart Lab'}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-200 transition-colors">
                    {lang === 'ar' ? 'تفاعلات، موازنة معادلات، وجدول دوري تفاعلي' : 'Simulate reactions, balance equations & explore elements'}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all pt-4">
                    <span>{lang === 'ar' ? 'دخول المختبر' : 'Enter Lab'}</span>
                    <ChevronLeft size={16} className="rotate-180 group-hover:text-white" />
                  </div>
                </div>
              </button>

              {/* AI Tutor Card (Inline) */}
              <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-white/5 rounded-[2.5rem] p-1 overflow-visible shadow-2xl relative backdrop-blur-xl group hover:shadow-[0_0_60px_rgba(168,85,247,0.15)] transition-shadow duration-500">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-[2.5rem] opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
                <div className="relative bg-slate-900 rounded-[2.3rem] p-6 md:p-8 h-full overflow-hidden">
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-float">
                      <User size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-300 transition-colors">
                        {lang === 'ar' ? 'المساعد الذكي' : 'AI Tutor'}
                      </h2>
                      <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {lang === 'ar' ? 'متصل الآن' : 'Online Now'}
                      </span>
                    </div>
                  </div>
                  <AiTutor lang={lang} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Views Rendering */}
        <div className="transition-opacity duration-500">
          {activeView === 'scanner' && (
            <Scanner lang={lang} onScanComplete={() => addXp(50)} />
          )}

          {activeView === 'lab' && (
            <StudyLabContainer lang={lang} />
          )}
        </div>

      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-full p-2.5 flex gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 hover:scale-105 transition-transform duration-300 ring-1 ring-white/5">
        <button
          onClick={() => setActiveView('home')}
          className={`px-6 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 relative overflow-hidden group ${activeView === 'home' ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)] font-black' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          <Home size={20} className={activeView === 'home' ? 'animate-bounce-short' : ''} />
          {activeView === 'home' && <span className="text-xs tracking-wide">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>}
        </button>

        <button
          onClick={() => setActiveView('scanner')}
          className={`px-6 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 relative overflow-hidden group ${activeView === 'scanner' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          <ScanLine size={20} className={activeView === 'scanner' ? 'animate-pulse' : ''} />
          {activeView === 'scanner' && <span className="text-xs tracking-wide">{lang === 'ar' ? 'فحص' : 'Scan'}</span>}
        </button>

        <button
          onClick={() => setActiveView('lab')}
          className={`px-6 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-300 relative overflow-hidden group ${activeView === 'lab' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] font-black' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          <Beaker size={20} className={activeView === 'lab' ? 'animate-wiggle' : ''} />
          {activeView === 'lab' && <span className="text-xs tracking-wide">{lang === 'ar' ? 'المختبر' : 'Lab'}</span>}
        </button>
      </nav>

    </div>
  );
};

export default App;