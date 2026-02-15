// @google/genai-api-fix: Refactored to use Firebase v8 compat syntax for authentication calls to resolve module export errors.
import React, { useState } from 'react';
import { auth } from '../services/firebase.ts';
import { Beaker, LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../types.ts';

interface AuthProps {
  lang: Language;
}

const Auth: React.FC<AuthProps> = ({ lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // FIX: Use Firebase v8 compat syntax for sign-in
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        // FIX: Use Firebase v8 compat syntax for user creation and profile update
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        if (userCredential.user) {
          await userCredential.user.updateProfile({ displayName: name });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(lang === 'ar' ? 'فشل التحقق: تأكد من البيانات المدخلة' : 'Auth failed: Check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-arabic relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl flex items-center justify-center text-slate-950 shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-6 animate-float">
            <Beaker size={40} />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-emerald-200 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
            Eco-Chemist
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isLogin 
              ? (lang === 'ar' ? 'مرحباً بك مجدداً في مختبرك الذكي' : 'Welcome back to your smart lab')
              : (lang === 'ar' ? 'أنشئ حسابك وابدأ رحلتك العلمية' : 'Create account & start your journey')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pr-12 pl-6 py-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pr-12 pl-6 py-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pr-12 pl-6 py-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group text-lg disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {isLogin ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (lang === 'ar' ? 'إنشاء الحساب' : 'Sign Up')}
                {isLogin ? <LogIn size={22} className="group-hover:translate-x-1 transition-transform" /> : <UserPlus size={22} />}
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-slate-500 hover:text-emerald-400 text-sm font-bold transition-colors underline-offset-4 hover:underline"
          >
            {isLogin 
              ? (lang === 'ar' ? 'لا تملك حساباً؟ انضم إلينا الآن' : "Don't have an account? Join now") 
              : (lang === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign In')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;