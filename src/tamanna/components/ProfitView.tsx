import React, { useMemo, useState } from 'react';
import { TrendingUp, CalendarDays, Info } from 'lucide-react';
import { Product, Sale, Expense } from '../types';
import { Language } from '../i18n/translations';
import { profitBetween, startOfDay, endOfDay } from '../utils/profit';

const tk = (n: number) => `৳${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const ProfitView: React.FC<{ products: Product[]; sales: Sale[]; expenses: Expense[]; lang: Language }> = ({ products, sales, expenses, lang }) => {
  const bn = lang === 'bn';
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const [from, setFrom] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(iso(today));

  const cards = useMemo(() => {
    const e = endOfDay(today);
    const ago = (n: number) => startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - n));
    return [
      { k: bn ? 'আজকের লাভ' : "Today's profit", r: profitBetween(sales, expenses, products, startOfDay(today), e) },
      { k: bn ? 'গতকালের লাভ' : 'Yesterday', r: profitBetween(sales, expenses, products, ago(1), endOfDay(ago(1))) },
      { k: bn ? 'শেষ ৭ দিনের লাভ' : 'Last 7 days', r: profitBetween(sales, expenses, products, ago(6), e) },
      { k: bn ? 'শেষ ৩০ দিনের লাভ' : 'Last 30 days', r: profitBetween(sales, expenses, products, ago(29), e) },
      { k: bn ? 'এই মাসের লাভ' : 'This month', r: profitBetween(sales, expenses, products, new Date(today.getFullYear(), today.getMonth(), 1), e) },
    ];
  }, [sales, expenses, products, bn]); // eslint-disable-line

  const daily = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return { d, r: profitBetween(sales, expenses, products, startOfDay(d), endOfDay(d)) };
  }), [sales, expenses, products]); // eslint-disable-line

  const custom = useMemo(() => profitBetween(sales, expenses, products, startOfDay(new Date(from)), endOfDay(new Date(to))), [from, to, sales, expenses, products]);
  const anyEstimated = cards.some(c => c.r.estimated > 0) || custom.estimated > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{bn ? 'লাভ / ক্ষতি রিপোর্ট' : 'Profit / Loss Report'}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{bn ? 'দিন, সপ্তাহ ও মাস অনুযায়ী আসল লাভ।' : 'Real profit by day, week and month.'}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(c => (
          <div key={c.k} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"><TrendingUp className="h-4 w-4 text-[#4a1fb8] dark:text-violet-400" />{c.k}</div>
            <div className={`mt-2 text-2xl font-extrabold ${c.r.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{tk(c.r.netProfit)}</div>
            <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
              <div>{bn ? 'বিক্রি' : 'Sales'}: {tk(c.r.sales)} · {c.r.invoices} {bn ? 'বিল' : 'invoices'}</div>
              <div>{bn ? 'মোট লাভ' : 'Gross'}: {tk(c.r.grossProfit)} · {bn ? 'খরচ' : 'Expenses'}: {tk(c.r.expenses)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <CalendarDays className="h-5 w-5 text-[#4a1fb8] dark:text-violet-400" />
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{bn ? 'শুরু' : 'From'}<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white" /></label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">{bn ? 'শেষ' : 'To'}<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white" /></label>
          <div className="ml-auto text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">{bn ? 'নির্বাচিত সময়ের নিট লাভ' : 'Net profit for range'}</div>
            <div className={`text-3xl font-extrabold ${custom.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>{tk(custom.netProfit)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{bn ? 'বিক্রি' : 'Sales'} {tk(custom.sales)} · {bn ? 'খরচ' : 'Expenses'} {tk(custom.expenses)}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400"><tr>
              <th className="px-4 py-2 text-left">{bn ? 'তারিখ' : 'Date'}</th><th className="px-4 py-2 text-right">{bn ? 'বিল' : 'Invoices'}</th><th className="px-4 py-2 text-right">{bn ? 'বিক্রি' : 'Sales'}</th><th className="px-4 py-2 text-right">{bn ? 'মোট লাভ' : 'Gross profit'}</th><th className="px-4 py-2 text-right">{bn ? 'খরচ' : 'Expenses'}</th><th className="px-4 py-2 text-right">{bn ? 'নিট লাভ' : 'Net profit'}</th>
            </tr></thead>
            <tbody>
              {daily.map(({ d, r }) => (
                <tr key={d.toDateString()} className="border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-2">{d.toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-2 text-right">{r.invoices}</td>
                  <td className="px-4 py-2 text-right font-mono">{tk(r.sales)}</td>
                  <td className="px-4 py-2 text-right font-mono">{tk(r.grossProfit)}</td>
                  <td className="px-4 py-2 text-right font-mono">{tk(r.expenses)}</td>
                  <td className={`px-4 py-2 text-right font-mono font-bold ${r.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>{tk(r.netProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {anyEstimated && (
        <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{bn ? 'পুরনো (hisabnikash থেকে আনা) বিলে পণ্যের তালিকা নেই, তাই সেগুলোর লাভ পণ্যের গড় কেনা-বেচা দামের ব্যবধান দিয়ে আনুমানিক হিসাব করা হয়েছে। নতুন বিলের লাভ একদম সঠিক।' : 'Older imported invoices have no item lines, so their profit is estimated from the average product margin. New invoices are exact.'}</p>
      )}
    </div>
  );
};
