import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Language } from '../i18n/translations';

const ROLES = [
  { key: 'super_admin', en: 'Super Admin', bn: 'সুপার অ্যাডমিন', limit: 2 },
  { key: 'admin', en: 'Branch Admin', bn: 'ব্রাঞ্চ অ্যাডমিন', limit: 1 },
  { key: 'cashier', en: 'Cashier', bn: 'ক্যাশিয়ার', limit: 5 },
];

const PERMS: { en: string; bn: string; r: string[] }[] = [
  { en: 'POS & add sale', bn: 'পিওএস ও বিক্রয়', r: ['super_admin', 'admin', 'cashier'] },
  { en: 'View products & stock', bn: 'পণ্য ও স্টক দেখা', r: ['super_admin', 'admin', 'cashier'] },
  { en: 'Add products / purchases', bn: 'পণ্য / ক্রয় যোগ', r: ['super_admin', 'admin'] },
  { en: 'Contacts, expenses, transfers', bn: 'কন্টাক্ট, খরচ, ট্রান্সফার', r: ['super_admin', 'admin'] },
  { en: 'Reports', bn: 'রিপোর্ট', r: ['super_admin', 'admin'] },
  { en: 'Edit any record', bn: 'যেকোনো তথ্য এডিট', r: ['super_admin'] },
  { en: 'Delete (always audit-logged)', bn: 'ডিলিট (অডিট লগসহ)', r: ['super_admin'] },
  { en: 'Manage staff & roles', bn: 'স্টাফ ও রোল ম্যানেজ', r: ['super_admin'] },
  { en: 'Jump into other accounts', bn: 'অন্য অ্যাকাউন্টে জাম্প', r: ['super_admin'] },
];

export const RolesView: React.FC<{ lang: Language }> = ({ lang }) => {
  const bn = lang === 'bn';
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    supabase.from('user_roles').select('role').then(({ data }) => {
      const c: Record<string, number> = {};
      (data || []).forEach((r: any) => { c[r.role] = (c[r.role] || 0) + 1; });
      setCounts(c);
    });
  }, []);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{bn ? 'রোল ও পারমিশন' : 'Roles'}</h1>
        <p className="text-sm text-slate-500">{bn ? 'প্রতিটি রোলের অনুমতি ও বর্তমান স্টাফ সংখ্যা।' : 'What each role can do, and how many staff hold it.'}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {ROLES.map(r => (
          <div key={r.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#4a1fb8]"><ShieldCheck className="h-5 w-5" /><span className="font-bold">{bn ? r.bn : r.en}</span></div>
            <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white" data-testid={`role-count-${r.key}`}>{counts[r.key] || 0}<span className="text-base font-semibold text-slate-400"> / {r.limit}</span></div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3 text-left">{bn ? 'অনুমতি' : 'Permission'}</th>{ROLES.map(r => <th key={r.key} className="px-4 py-3">{bn ? r.bn : r.en}</th>)}</tr>
          </thead>
          <tbody>
            {PERMS.map(p => (
              <tr key={p.en} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{bn ? p.bn : p.en}</td>
                {ROLES.map(r => <td key={r.key} className="px-4 py-3 text-center">{p.r.includes(r.key) ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-slate-300" />}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
