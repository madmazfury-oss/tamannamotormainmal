import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sale, Purchase, Expense } from '../types';
import { billTotals, productBreakdown } from '../utils/profit';

const tk = (n: number) => `৳${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  bn: boolean;
  initialTab?: 'products' | 'bills' | 'purchases' | 'dues';
}

export const ProfitDetailsModal: React.FC<Props> = ({ open, onClose, title, sales, purchases, expenses, bn, initialTab = 'products' }) => {
  const [tab, setTab] = useState(initialTab);
  React.useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);
  const live = useMemo(() => sales.filter(s => s.type !== 'draft'), [sales]);
  const t = useMemo(() => billTotals(live, purchases, expenses), [live, purchases, expenses]);
  const rows = useMemo(() => productBreakdown(live), [live]);
  if (!open) return null;

  const tabs = [
    { k: 'products', l: bn ? 'পণ্য অনুযায়ী' : 'By product' },
    { k: 'bills', l: bn ? 'বিক্রির বিল' : 'Sale bills' },
    { k: 'purchases', l: bn ? 'ক্রয়ের বিল' : 'Purchase bills' },
    { k: 'dues', l: bn ? 'বাকি' : 'Dues' },
  ] as const;
  const th = 'px-3 py-2 text-left text-[11px] font-bold uppercase text-home-subtle';
  const td = 'px-3 py-2 text-home-ink';
  const num = 'px-3 py-2 text-right font-mono tabular-nums text-home-ink';
  const tone = (n: number) => (n >= 0 ? 'text-home-positive' : 'text-home-danger');

  return (
    <div className="tm-dashboard fixed inset-0 z-[80] flex items-center justify-center bg-home-banner-shade/60 p-3" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-home-border bg-home-surface shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-home-border px-5 py-3">
          <h2 className="text-lg font-bold text-home-ink">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={bn ? 'বন্ধ করুন' : 'Close'}><X /></Button>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-home-border p-4 text-sm md:grid-cols-6">
          {[
            [bn ? 'মোট বিক্রি' : 'Sold', t.sold, ''],
            [bn ? 'মোট ক্রয়' : 'Bought', t.bought, ''],
            [bn ? 'খরচ' : 'Expenses', t.spent, ''],
            [bn ? 'লাভ' : 'Profit', t.profit, tone(t.profit)],
            [bn ? 'পাওনা (কাস্টমার)' : 'Receivable', t.receivable, ''],
            [bn ? 'দেনা (সাপ্লায়ার)' : 'Payable', t.payable, ''],
          ].map(([l, v, c]) => (
            <div key={l as string} className="rounded-lg bg-home-muted p-2.5">
              <div className="text-[11px] text-home-subtle">{l}</div>
              <div className={`font-mono text-base font-bold tabular-nums ${c || 'text-home-ink'}`}>{tk(v as number)}</div>
            </div>
          ))}
          <p className="col-span-2 text-[11px] text-home-subtle md:col-span-6">{bn ? 'লাভ = মোট বিক্রির বিল − মোট ক্রয়ের বিল − খরচ (বিলের আসল টাকা দিয়ে)।' : 'Profit = total sale bills − total purchase bills − expenses (actual bill amounts).'}</p>
        </div>

        <div className="flex gap-1 border-b border-home-border px-4 pt-2">
          {tabs.map(x => (
            <button key={x.k} onClick={() => setTab(x.k)} className={`rounded-t-md px-3 py-2 text-xs font-semibold ${tab === x.k ? 'bg-home-positive text-home-on-positive' : 'text-home-subtle hover:bg-home-muted'}`}>{x.l}</button>
          ))}
        </div>

        <div className="flex-1 overflow-auto">
          {tab === 'products' && (
            rows.length === 0 ? <p className="p-6 text-sm text-home-subtle">{bn ? 'এই সময়ে পণ্যের তালিকাসহ কোনো বিল নেই। পুরনো আনা বিলে পণ্যের তালিকা ছিল না।' : 'No bills with item lines in this period. Older imported bills have no item lines.'}</p> :
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-home-muted"><tr><th className={th}>{bn ? 'পণ্য' : 'Product'}</th><th className={`${th} text-right`}>{bn ? 'পরিমাণ' : 'Qty'}</th><th className={`${th} text-right`}>{bn ? 'বিক্রি' : 'Sold'}</th><th className={`${th} text-right`}>{bn ? 'কেনা দাম' : 'Cost'}</th><th className={`${th} text-right`}>{bn ? 'লাভ' : 'Profit'}</th></tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r.productId} className="border-t border-home-border"><td className={td}>{r.name}</td><td className={num}>{+r.qty.toFixed(3)}</td><td className={num}>{tk(r.soldAmount)}</td><td className={num}>{tk(r.costAmount)}</td><td className={`${num} font-bold ${tone(r.profit)}`}>{tk(r.profit)}</td></tr>
              ))}</tbody>
            </table>
          )}
          {tab === 'bills' && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-home-muted"><tr><th className={th}>{bn ? 'বিল নং' : 'Invoice'}</th><th className={th}>{bn ? 'তারিখ' : 'Date'}</th><th className={th}>{bn ? 'কাস্টমার' : 'Customer'}</th><th className={`${th} text-right`}>{bn ? 'বিক্রি' : 'Total'}</th><th className={`${th} text-right`}>{bn ? 'কেনা দাম' : 'Cost'}</th><th className={`${th} text-right`}>{bn ? 'লাভ' : 'Profit'}</th><th className={`${th} text-right`}>{bn ? 'বাকি' : 'Due'}</th></tr></thead>
              <tbody>{live.map(s => {
                const has = !!(s.items && s.items.length);
                const cost = has ? s.items!.reduce((a, it) => a + (it.product?.unitPurchasePrice || 0) * it.quantity, 0) : 0;
                const p = (s.totalAmount || 0) - cost;
                return (
                  <tr key={s.id} className="border-t border-home-border"><td className={td}>{s.invoiceNo}</td><td className={`${td} whitespace-nowrap text-xs`}>{s.saleDate}</td><td className={td}>{s.customerName}</td><td className={num}>{tk(s.totalAmount)}</td><td className={num}>{has ? tk(cost) : '—'}</td><td className={`${num} ${has ? tone(p) : ''}`}>{has ? tk(p) : '—'}</td><td className={num}>{tk(s.invoiceDue)}</td></tr>
                );
              })}</tbody>
            </table>
          )}
          {tab === 'purchases' && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-home-muted"><tr><th className={th}>{bn ? 'ক্রয় নং' : 'Purchase'}</th><th className={th}>{bn ? 'তারিখ' : 'Date'}</th><th className={th}>{bn ? 'সাপ্লায়ার' : 'Supplier'}</th><th className={`${th} text-right`}>{bn ? 'মোট' : 'Total'}</th><th className={`${th} text-right`}>{bn ? 'দেনা' : 'Due'}</th></tr></thead>
              <tbody>{purchases.map(p => (
                <tr key={p.id} className="border-t border-home-border"><td className={td}>{p.purchaseNo}</td><td className={`${td} whitespace-nowrap text-xs`}>{p.purchaseDate}</td><td className={td}>{p.supplierName}</td><td className={num}>{tk(p.grandTotal)}</td><td className={num}>{tk(p.paymentDue)}</td></tr>
              ))}</tbody>
            </table>
          )}
          {tab === 'dues' && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-home-muted"><tr><th className={th}>{bn ? 'ধরন' : 'Type'}</th><th className={th}>{bn ? 'বিল নং' : 'Bill'}</th><th className={th}>{bn ? 'নাম' : 'Name'}</th><th className={th}>{bn ? 'তারিখ' : 'Date'}</th><th className={`${th} text-right`}>{bn ? 'বাকি' : 'Due'}</th></tr></thead>
              <tbody>
                {live.filter(s => (s.invoiceDue || 0) > 0).map(s => (
                  <tr key={s.id} className="border-t border-home-border"><td className={`${td} text-home-positive`}>{bn ? 'পাওনা' : 'Receivable'}</td><td className={td}>{s.invoiceNo}</td><td className={td}>{s.customerName}</td><td className={`${td} text-xs`}>{s.saleDate}</td><td className={num}>{tk(s.invoiceDue)}</td></tr>
                ))}
                {purchases.filter(p => (p.paymentDue || 0) > 0).map(p => (
                  <tr key={p.id} className="border-t border-home-border"><td className={`${td} text-home-danger`}>{bn ? 'দেনা' : 'Payable'}</td><td className={td}>{p.purchaseNo}</td><td className={td}>{p.supplierName}</td><td className={`${td} text-xs`}>{p.purchaseDate}</td><td className={num}>{tk(p.paymentDue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
