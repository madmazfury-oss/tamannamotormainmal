import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, Bike, ArrowLeft } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

interface Props {
  lang: 'en' | 'bn';
  onToggleLang: () => void;
  businessName?: string;
  logoUrl?: string;
}

export const AuthScreen: React.FC<Props> = ({ lang, onToggleLang, businessName, logoUrl }) => {
  const bn = lang === 'bn';
  const t = (en: string, b: string) => (bn ? b : en);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo(''); setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        if (password.length < 6) throw new Error(t('Password must be at least 6 characters', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'));
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, phone } },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo(t('Account created! Check your email to confirm, then sign in.', 'অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল চেক করে কনফার্ম করুন, তারপর লগইন করুন।'));
          setMode('signin');
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setInfo(t('Password reset link sent to your email.', 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'));
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      setError(msg.includes('Invalid login') ? t('Wrong email or password', 'ইমেইল বা পাসওয়ার্ড ভুল') : msg);
    } finally { setBusy(false); }
  };

  const google = async () => {
    setError('');
    const res = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if ((res as any)?.error) setError(String((res as any).error.message || (res as any).error));
  };

  const input = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 pl-11 pr-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 transition';

  return (
    <div className="tm-auth min-h-screen grid lg:grid-cols-[1.1fr_1fr] text-slate-900 dark:text-slate-100">
      <div className="tm-auth-hero relative hidden lg:flex flex-col justify-between p-12 overflow-hidden text-white">
        <div className="tm-blob absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-fuchsia-500/40 blur-3xl" />
        <div className="tm-blob tm-blob-2 absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-amber-400/30 blur-3xl" />
        <div className="absolute inset-0 tm-grid opacity-30" />
        <div className="relative flex items-center gap-3">
          {logoUrl ? <img src={logoUrl} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40" /> :
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 grid place-items-center shadow-lg shadow-orange-500/40"><Bike className="w-8 h-8 text-white" /></div>}
          <div>
            <div className="font-extrabold tracking-[0.15em] text-xl">{businessName || 'TAMANNA MOTORS'}</div>
            <div className="text-xs text-white/70">{t('Hazigonj Branch, Chandpur', 'হাজীগঞ্জ শাখা, চাঁদপুর')}</div>
          </div>
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-semibold mb-6 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {t('Live cloud sync', 'লাইভ ক্লাউড সিঙ্ক')}
          </div>
          <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.05]">
            {t('Run your showroom', 'আপনার শোরুম চালান')}<br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">{t('with confidence.', 'আত্মবিশ্বাসের সাথে।')}</span>
          </h1>
          <p className="mt-5 text-white/75 max-w-md text-lg">
            {t('POS, inventory, dues and reports — synced live for every staff member.',
               'POS, ইনভেন্টরি, বাকি ও রিপোর্ট — সব স্টাফের জন্য লাইভ সিঙ্ক।')}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
            {[[t('Fast POS','দ্রুত POS'),'⚡'],[t('Profit reports','লাভের রিপোর্ট'),'📈'],[t('Stock control','স্টক নিয়ন্ত্রণ'),'📦']].map(([l,i]) => (
              <div key={l} className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-4 hover:bg-white/15 transition">
                <div className="text-2xl">{i}</div><div className="mt-2 text-sm font-semibold">{l}</div>
              </div>))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="w-4 h-4 text-amber-300" /> {t('Secure encrypted sign-in', 'নিরাপদ এনক্রিপ্টেড লগইন')}
        </div>
      </div>

      <main className="relative flex items-center justify-center p-6 overflow-hidden">
        <div className="tm-blob absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl lg:hidden" />
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <button onClick={onToggleLang} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-amber-500">
              {bn ? 'English' : 'বাংলা'}
            </button>
          </div>
          <div className="tm-auth-card relative rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-violet-900/15 border border-white dark:border-slate-800 p-8 sm:p-10">
            {mode === 'forgot' && (
              <button onClick={() => setMode('signin')} className="flex items-center gap-1 text-sm text-slate-500 mb-4 hover:text-amber-600"><ArrowLeft className="w-4 h-4" />{t('Back', 'ফিরে যান')}</button>
            )}
            <h2 className="text-2xl font-extrabold">
              {mode === 'signin' ? t('Welcome back', 'স্বাগতম') : mode === 'signup' ? t('Create account', 'অ্যাকাউন্ট তৈরি করুন') : t('Reset password', 'পাসওয়ার্ড রিসেট')}
            </h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              {mode === 'signin' ? t('Sign in to continue to your dashboard', 'ড্যাশবোর্ডে যেতে লগইন করুন')
                : mode === 'signup' ? t('New staff accounts start as cashier', 'নতুন স্টাফ অ্যাকাউন্ট ক্যাশিয়ার হিসেবে শুরু হয়')
                : t("We'll email you a reset link", 'আমরা ইমেইলে রিসেট লিংক পাঠাব')}
            </p>

            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-100 dark:bg-slate-800">
                {(['signin', 'signup'] as Mode[]).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(''); }}
                    className={`py-2 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-white dark:bg-slate-950 shadow text-violet-700 dark:text-violet-300' : 'text-slate-500'}`}>
                    {m === 'signin' ? t('Sign in', 'লগইন') : t('Sign up', 'সাইন আপ')}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {mode === 'signup' && (<>
                <div className="relative"><User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input required className={input} placeholder={t('Full name', 'পুরো নাম')} value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="relative"><Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input className={input} placeholder={t('Phone (optional)', 'ফোন (ঐচ্ছিক)')} value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </>)}
              <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input required type="email" className={input} placeholder={t('Email address', 'ইমেইল ঠিকানা')} value={email} onChange={e => setEmail(e.target.value)} /></div>
              {mode !== 'forgot' && (
                <div className="relative"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input required type={show ? 'text' : 'password'} className={input} placeholder={t('Password', 'পাসওয়ার্ড')} value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-3.5 text-slate-400">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              )}
              {mode === 'signin' && (
                <div className="text-right"><button type="button" onClick={() => setMode('forgot')} className="text-xs font-semibold text-amber-600 hover:underline">{t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}</button></div>
              )}
              {error && <div className="text-sm rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 px-4 py-2.5">{error}</div>}
              {info && <div className="text-sm rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 px-4 py-2.5">{info}</div>}
              <button disabled={busy} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' ? t('Sign in', 'লগইন') : mode === 'signup' ? t('Create account', 'অ্যাকাউন্ট তৈরি') : t('Send reset link', 'রিসেট লিংক পাঠান')}
              </button>
            </form>

            {mode !== 'forgot' && (<>
              <div className="flex items-center gap-3 my-5 text-xs text-slate-400"><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />{t('or', 'অথবা')}<div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" /></div>
              <button onClick={google} className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                {t('Continue with Google', 'Google দিয়ে চালিয়ে যান')}
              </button>
            </>)}
          </div>
        </div>
      </main>
    </div>
  );
};
