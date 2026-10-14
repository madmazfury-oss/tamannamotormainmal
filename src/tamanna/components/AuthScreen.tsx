import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, Construction, ArrowLeft, ArrowRight, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import excavatorImage from '@/assets/excavator-login.jpg';

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

  const switchMode = (next: Mode) => { setMode(next); setError(''); setInfo(''); };

  return (
    <div className="tm-excavator-auth">
      <img className="tm-excavator-backdrop" src={excavatorImage} alt={t('Excavator, hydraulic pump, gears and track parts in a workshop', 'ওয়ার্কশপে এক্সকাভেটর, হাইড্রোলিক পাম্প, গিয়ার ও ট্র্যাকের যন্ত্রাংশ')} width={1920} height={1280} fetchPriority="high" />
      <div className="tm-excavator-shade" />
      <header className="tm-excavator-header">
        <a href="/" className="tm-excavator-brand">
          {logoUrl ? <img src={logoUrl} alt={businessName || 'TAMANNA MOTORS'} width={48} height={48} /> : <span className="tm-excavator-mark"><Construction aria-hidden="true" /></span>}
          <span><strong>{businessName || 'TAMANNA MOTORS'}</strong><small>{t('EXCAVATOR & SPARE PARTS', 'এক্সকাভেটর ও যন্ত্রাংশ')}</small></span>
        </a>
        <Button variant="ghost" onClick={onToggleLang} className="tm-excavator-language"><Globe />{bn ? 'English' : 'বাংলা'}</Button>
      </header>

      <section className="tm-excavator-story">
        <span className="tm-excavator-eyebrow">{t('HEAVY MACHINERY. PRECISION PARTS.', 'শক্তিশালী যন্ত্র। নির্ভরযোগ্য যন্ত্রাংশ।')}</span>
        <h1>{businessName || 'TAMANNA MOTORS'}<span>{t('Excavator & spare parts', 'এক্সকাভেটর ও যন্ত্রাংশ')}</span></h1>
        <div className="tm-excavator-location"><span />{t('Hazigonj Branch · Chandpur, Bangladesh', 'হাজীগঞ্জ শাখা · চাঁদপুর, বাংলাদেশ')}</div>
      </section>

      <main className="tm-excavator-login">
        <div className="tm-excavator-form">
          <div className="tm-excavator-section-label"><span />{t('STAFF ACCESS', 'স্টাফ লগইন')}</div>
          {mode === 'forgot' && <Button variant="ghost" className="tm-excavator-back" onClick={() => switchMode('signin')}><ArrowLeft />{t('Back', 'ফিরে যান')}</Button>}
          <h2>{mode === 'signin' ? t('Welcome back.', 'স্বাগতম।') : mode === 'signup' ? t('Join the team.', 'টিমে যোগ দিন।') : t('Reset password.', 'পাসওয়ার্ড রিসেট।')}</h2>
          <p className="tm-excavator-subtitle">{mode === 'signin' ? t('Sign in to your account', 'আপনার অ্যাকাউন্টে লগইন করুন') : mode === 'signup' ? t('Create your staff account', 'আপনার স্টাফ অ্যাকাউন্ট তৈরি করুন') : t("We'll send a reset link to your email", 'আপনার ইমেইলে রিসেট লিংক পাঠানো হবে')}</p>
          {mode !== 'forgot' && <div className="tm-excavator-tabs" role="tablist" aria-label={t('Account access', 'অ্যাকাউন্ট প্রবেশ')}>
            {(['signin', 'signup'] as Mode[]).map(m => <Button key={m} variant="ghost" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}>{m === 'signin' ? t('Sign in', 'লগইন') : t('Create account', 'অ্যাকাউন্ট তৈরি')}</Button>)}
          </div>}
          <form onSubmit={submit} className="tm-excavator-fields">
            {mode === 'signup' && <>
              <label>{t('Full name', 'পুরো নাম')}<div className="tm-excavator-field"><User /><input required autoComplete="name" placeholder={t('Your name', 'আপনার নাম')} value={name} onChange={e => setName(e.target.value)} /></div></label>
              <label>{t('Phone (optional)', 'ফোন (ঐচ্ছিক)')}<div className="tm-excavator-field"><Phone /><input type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} /></div></label>
            </>}
            <label>{t('Email address', 'ইমেইল ঠিকানা')}<div className="tm-excavator-field"><Mail /><input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div></label>
            {mode !== 'forgot' && <label>{t('Password', 'পাসওয়ার্ড')}<div className="tm-excavator-field"><Lock /><input required type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /><Button type="button" variant="ghost" size="icon" title={show ? t('Hide password', 'পাসওয়ার্ড লুকান') : t('Show password', 'পাসওয়ার্ড দেখুন')} aria-label={show ? t('Hide password', 'পাসওয়ার্ড লুকান') : t('Show password', 'পাসওয়ার্ড দেখুন')} onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</Button></div></label>}
            {mode === 'signin' && <Button variant="link" type="button" className="tm-excavator-forgot" onClick={() => switchMode('forgot')}>{t('Forgot password?', 'পাসওয়ার্ড ভুলে গেছেন?')}</Button>}
            {error && <div role="alert" className="tm-excavator-error">{error}</div>}
            {info && <div role="status" className="tm-excavator-info">{info}</div>}
            <Button disabled={busy} type="submit" className="tm-excavator-submit">{busy ? <Loader2 className="animate-spin" /> : null}{mode === 'signin' ? t('Sign in', 'লগইন করুন') : mode === 'signup' ? t('Create account', 'অ্যাকাউন্ট তৈরি করুন') : t('Send reset link', 'রিসেট লিংক পাঠান')}<ArrowRight /></Button>
          </form>
          {mode !== 'forgot' && <><div className="tm-excavator-divider"><span />{t('or continue with', 'অথবা')}<span /></div><Button variant="outline" onClick={google} className="tm-excavator-google"><span className="tm-google-letter" aria-hidden="true">G</span> Google</Button></>}
          <div className="tm-excavator-security"><ShieldCheck />{t('Secure staff sign-in', 'নিরাপদ স্টাফ লগইন')}</div>
        </div>
      </main>
      <footer className="tm-excavator-footer"><span>TAMANNA MOTORS</span><span>{t('EXCAVATOR • HYDRAULICS • UNDERCARRIAGE', 'এক্সকাভেটর • হাইড্রোলিক্স • ট্র্যাকের যন্ত্রাংশ')}</span></footer>
    </div>
  );
};
