import React, { useMemo, useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Sale } from '../types';
import { askSalesQuestion } from '../lib/salesAi.functions';

interface Props {
  sales: Sale[];
  parseDate: (raw?: string) => number;
  lang: 'en' | 'bn' | string;
}

const fmtDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function buildSalesContext(sales: Sale[], parseDate: (raw?: string) => number): string {
  const now = Date.now();
  const daily: Record<string, { n: number; total: number; due: number }> = {};
  const products: Record<string, { qty: number; revenue: number }> = {};
  const customers: Record<string, { n: number; total: number; due: number }> = {};
  const methods: Record<string, number> = {};
  let total = 0, due = 0;
  const sorted = [...sales].sort((a, b) => parseDate(b.saleDate) - parseDate(a.saleDate));
  for (const s of sorted) {
    const t = parseDate(s.saleDate);
    const day = t ? fmtDay(t) : 'unknown';
    const amt = Number(s.totalAmount) || 0;
    const d = Number(s.invoiceDue) || 0;
    total += amt; due += d;
    (daily[day] ||= { n: 0, total: 0, due: 0 });
    daily[day].n++; daily[day].total += amt; daily[day].due += d;
    const c = s.customerName || 'Walk-in';
    (customers[c] ||= { n: 0, total: 0, due: 0 });
    customers[c].n++; customers[c].total += amt; customers[c].due += d;
    methods[s.paymentMethod || 'Other'] = (methods[s.paymentMethod || 'Other'] || 0) + amt;
    for (const it of s.items || []) {
      const name = it?.product?.name || 'Unknown';
      const price = Number(it.customPrice ?? it.product?.sellingPrice ?? 0) || 0;
      (products[name] ||= { qty: 0, revenue: 0 });
      products[name].qty += Number(it.quantity) || 0;
      products[name].revenue += price * (Number(it.quantity) || 0);
    }
  }
  const r = (n: number) => Math.round(n * 100) / 100;
  const topProducts = Object.entries(products).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 40)
    .map(([k, v]) => `${k} | qty ${r(v.qty)} | ৳${r(v.revenue)}`);
  const topCustomers = Object.entries(customers).sort((a, b) => b[1].total - a[1].total).slice(0, 40)
    .map(([k, v]) => `${k} | ${v.n} sales | ৳${r(v.total)} | due ৳${r(v.due)}`);
  const days = Object.entries(daily).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 400)
    .map(([k, v]) => `${k} | ${v.n} | ৳${r(v.total)} | due ৳${r(v.due)}`);
  const recent = sorted.slice(0, 60).map(s => {
    const t = parseDate(s.saleDate);
    return `${s.invoiceNo} | ${t ? new Date(t).toLocaleString('en-GB') : s.saleDate} | ${s.customerName} | ${s.paymentMethod} | ${s.paymentStatus} | ৳${r(Number(s.totalAmount) || 0)} | due ৳${r(Number(s.invoiceDue) || 0)}`;
  });
  return [
    `Today: ${new Date(now).toLocaleString('en-GB')} (Asia/Dhaka local)`,
    `Total sales: ${sales.length} invoices, ৳${r(total)}, outstanding due ৳${r(due)}`,
    `Payment methods: ${Object.entries(methods).map(([k, v]) => `${k} ৳${r(v)}`).join(', ')}`,
    `\nDAILY (date | invoices | total | due):\n${days.join('\n')}`,
    `\nTOP PRODUCTS (name | qty | revenue):\n${topProducts.join('\n') || 'no item details'}`,
    `\nTOP CUSTOMERS:\n${topCustomers.join('\n')}`,
    `\nLATEST 60 INVOICES:\n${recent.join('\n')}`,
  ].join('\n');
}

export const SalesAiView: React.FC<Props> = ({ sales, parseDate, lang }) => {
  const bn = lang === 'bn';
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string; err?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const context = useMemo(() => buildSalesContext(sales, parseDate), [sales, parseDate]);
  const suggestions = bn
    ? ['গত ৭ দিনে মোট কত বিক্রি হয়েছে?', 'সবচেয়ে বেশি বিক্রি হওয়া ৫টা পণ্য কোনগুলো?', 'কোন কাস্টমারের কাছে সবচেয়ে বেশি বাকি?', 'এই মাসে বিক্রি বাড়াতে কী করা উচিত?']
    : ['Total sales in the last 7 days?', 'Top 5 best-selling products?', 'Which customers owe the most?', 'How can I grow sales this month?'];

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true); setQuestion('');
    try {
      const res = await askSalesQuestion({ data: { question: text, dataContext: context } });
      setHistory(h => [{ q: text, a: res.error || res.answer, err: !!res.error }, ...h]);
    } catch (e: any) {
      setHistory(h => [{ q: text, a: e?.message || 'Error', err: true }, ...h]);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{bn ? 'AI বিক্রয় সহকারী' : 'AI Sales Assistant'}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {bn ? `আপনার ${sales.length}টা আসল বিক্রির হিসাব থেকে প্রশ্নের উত্তর দেয়।` : `Answers from your ${sales.length} real sales records.`}
        </p>
        <form onSubmit={e => { e.preventDefault(); ask(question); }} className="flex gap-2">
          <input value={question} onChange={e => setQuestion(e.target.value)} disabled={loading}
            placeholder={bn ? 'যেমন: গতকাল কত টাকা বিক্রি হয়েছে?' : 'e.g. How much did I sell yesterday?'}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={loading || !question.trim()}
            className="rounded-xl bg-primary px-5 text-primary-foreground font-bold disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {bn ? 'জিজ্ঞেস' : 'Ask'}
          </button>
        </form>
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map(s => (
            <button key={s} onClick={() => ask(s)} disabled={loading}
              className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-accent disabled:opacity-50">{s}</button>
          ))}
        </div>
      </div>
      {loading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{bn ? 'হিসাব করছি…' : 'Thinking…'}</div>}
      {history.map((h, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold text-foreground mb-2">❓ {h.q}</p>
          <div className={`whitespace-pre-wrap text-sm leading-relaxed ${h.err ? 'text-destructive' : 'text-foreground'}`}>{h.a}</div>
        </div>
      ))}
    </div>
  );
};
