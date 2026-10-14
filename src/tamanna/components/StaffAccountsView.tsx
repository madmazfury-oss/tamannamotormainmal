import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Shield, User, LogIn, Loader2, RefreshCw } from 'lucide-react';

export type StaffRole = 'super_admin' | 'admin' | 'cashier';
export interface StaffAccount { id: string; name: string; email: string; phone: string; role: StaffRole | null; }

export const ROLE_LIMITS: Record<StaffRole, number> = { super_admin: 2, admin: 1, cashier: 5 };

interface Props {
  lang: 'en' | 'bn';
  myId: string;
  onJump: (acc: StaffAccount) => void;
}

export const StaffAccountsView: React.FC<Props> = ({ lang, myId, onJump }) => {
  const bn = lang === 'bn';
  const t = (en: string, b: string) => (bn ? b : en);
  const label: Record<StaffRole, string> = {
    super_admin: t('Super Admin', 'সুপার অ্যাডমিন'),
    admin: t('Branch Admin', 'ব্রাঞ্চ অ্যাডমিন'),
    cashier: t('Cashier', 'ক্যাশিয়ার'),
  };
  const icon = { super_admin: Crown, admin: Shield, cashier: User };
  const [rows, setRows] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, phone, email').order('created_at'),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    setRows((profs || []).map((p: any) => ({
      id: p.id, name: p.full_name || '—', email: p.email || '', phone: p.phone || '',
      role: ((roles || []).find((r: any) => r.user_id === p.id)?.role as StaffRole) || null,
    })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const count = (r: StaffRole) => rows.filter(x => x.role === r).length;

  const setRole = async (acc: StaffAccount, role: StaffRole | '') => {
    setMsg('');
    if (acc.id === myId && role !== 'super_admin') { setMsg(t("You can't remove your own Super Admin role.", 'নিজের সুপার অ্যাডমিন রোল সরানো যাবে না।')); return; }
    if (role && acc.role !== role && count(role) >= ROLE_LIMITS[role]) {
      setMsg(t(`${label[role]} limit (${ROLE_LIMITS[role]}) is full.`, `${label[role]} সীমা (${ROLE_LIMITS[role]}টি) পূর্ণ।`)); return;
    }
    await supabase.from('user_roles').delete().eq('user_id', acc.id);
    if (role) {
      const { error } = await supabase.from('user_roles').insert({ user_id: acc.id, role });
      if (error) setMsg(error.message.includes('ROLE_LIMIT') ? t('Role limit reached.', 'রোলের সীমা পূর্ণ।') : error.message);
    }
    await supabase.from('audit_logs').insert({
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(), action_type: 'ROLE_CHANGED',
      entity_type: 'Staff', entity_id: acc.id, entity_title: acc.name, performed_by: myId,
      details: `${acc.role || 'none'} -> ${role || 'none'}`,
    });
    load();
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">{t('Staff accounts & roles', 'স্টাফ অ্যাকাউন্ট ও রোল')}</h2>
          <p className="text-xs text-slate-500">{t('Only Super Admin can manage roles and switch into accounts.', 'শুধু সুপার অ্যাডমিন রোল বদলাতে ও অন্য অ্যাকাউন্টে যেতে পারবেন।')}</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(ROLE_LIMITS) as StaffRole[]).map(r => {
          const I = icon[r];
          return (
            <div key={r} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <I className="w-5 h-5 text-amber-500" />
              <div className="mt-2 text-sm font-bold">{label[r]}</div>
              <div className="text-2xl font-extrabold font-mono">{count(r)}<span className="text-sm text-slate-400">/{ROLE_LIMITS[r]}</span></div>
            </div>
          );
        })}
      </div>

      {msg && <div className="rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 px-4 py-2.5 text-sm">{msg}</div>}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? <div className="p-10 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div> :
          rows.map(acc => (
            <div key={acc.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
              <div className="flex-1 min-w-[180px]">
                <div className="font-semibold text-sm">{acc.name} {acc.id === myId && <span className="text-xs text-amber-600">({t('you', 'আপনি')})</span>}</div>
                <div className="text-xs text-slate-500">{acc.email || acc.phone}</div>
              </div>
              <select value={acc.role || ''} onChange={e => setRole(acc, e.target.value as any)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm">
                <option value="">{t('No access (pending)', 'অনুমতি নেই (অপেক্ষমাণ)')}</option>
                {(Object.keys(ROLE_LIMITS) as StaffRole[]).map(r => <option key={r} value={r}>{label[r]}</option>)}
              </select>
              {acc.id !== myId && acc.role && (
                <button onClick={() => onJump(acc)} className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950">
                  <LogIn className="w-4 h-4" />{t('Jump in', 'অ্যাকাউন্টে যান')}
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
