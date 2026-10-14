import React, { useEffect, useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { Expense } from '../types';
import { CloudCollections } from '../data/firestoreSync';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
}

const DEFAULT_CATS = ['Rent', 'Utilities', 'Salaries', 'Logistics', 'Marketing', 'Maintenance', 'Office Supplies'];
const inp = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4a1fb8] focus:ring-2 focus:ring-violet-200';

const Field: React.FC<{ label: string; req?: boolean; children: React.ReactNode; wide?: boolean }> = ({ label, req, children, wide }) => (
  <label className={`block ${wide ? 'sm:col-span-3' : ''}`}>
    <span className="mb-1 block text-xs font-semibold text-slate-600">{label}{req && <span className="text-rose-500"> *</span>}</span>
    {children}
  </label>
);

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAddExpense }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [cats, setCats] = useState<string[]>(DEFAULT_CATS);
  const [taxes, setTaxes] = useState<{ name: string; rate: number }[]>([]);
  const [v, setV] = useState<Record<string, any>>({});
  useEffect(() => {
    if (!isOpen) return;
    setV({ location: 'Hazigonj Branch', category: '', date: today, paidOn: today, method: 'Cash', isRefund: false });
    const u1 = CloudCollections.subscribe<any>('expense_categories', it => it.length && setCats(it.map(x => x.name)));
    const u2 = CloudCollections.subscribe<any>('tax_rates', it => setTaxes(it.map(x => ({ name: x.name, rate: parseFloat(x.rate) || 0 }))));
    return () => { u1(); u2(); };
  }, [isOpen]); // eslint-disable-line

  if (!isOpen) return null;
  const set = (k: string) => (e: any) => setV(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const total = parseFloat(v.total) || 0;
  const tax = taxes.find(t => t.name === v.tax);
  const paid = v.paid === undefined || v.paid === '' ? total : parseFloat(v.paid) || 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0) return alert('Total amount must be greater than 0');
    const exp: any = {
      id: `exp-${Date.now()}`,
      expenseNo: v.ref?.trim() || `EP${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      category: v.category || 'Utilities', subCategory: v.subCategory || '',
      businessLocation: v.location, expenseDate: v.date, amount: total,
      referenceNo: v.ref?.trim() || '', note: v.note?.trim() || '',
      expenseFor: v.expenseFor || '', contact: v.contact || '',
      tax: tax ? `${tax.name} (${tax.rate}%)` : '', isRefund: !!v.isRefund,
      paymentAmount: paid, paidOn: v.paidOn, paymentMethod: v.method, paymentNote: v.payNote || '',
      paymentStatus: paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Due', paymentDue: Math.max(0, total - paid),
    };
    onAddExpense(exp as Expense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#4a1fb8] to-[#6d3df0] px-5 py-4 text-white">
          <div className="flex items-center gap-2"><Receipt className="h-5 w-5" /><h3 className="text-lg font-bold">Add Expense</h3></div>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Business Location" req><select required className={inp} value={v.location} onChange={set('location')}><option>Hazigonj Branch</option></select></Field>
            <Field label="Expense Category"><select className={inp} value={v.category} onChange={set('category')}><option value="">Please select</option>{cats.map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Sub category"><input className={inp} value={v.subCategory || ''} onChange={set('subCategory')} /></Field>
            <Field label="Reference No"><input className={inp} placeholder="Leave empty to autogenerate" value={v.ref || ''} onChange={set('ref')} /></Field>
            <Field label="Date" req><input required type="date" className={inp} value={v.date} onChange={set('date')} /></Field>
            <Field label="Expense for"><input className={inp} placeholder="Staff name" value={v.expenseFor || ''} onChange={set('expenseFor')} /></Field>
            <Field label="Expense for contact"><input className={inp} placeholder="Customer / supplier" value={v.contact || ''} onChange={set('contact')} /></Field>
            <Field label="Applicable Tax"><select className={inp} value={v.tax || ''} onChange={set('tax')}><option value="">None</option>{taxes.map(t => <option key={t.name} value={t.name}>{t.name} ({t.rate}%)</option>)}</select></Field>
            <Field label="Total amount (৳)" req><input required type="number" step="0.01" min="0" className={inp} value={v.total || ''} onChange={set('total')} /></Field>
            <Field label="Expense note" wide><textarea rows={2} className={inp} value={v.note || ''} onChange={set('note')} /></Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={!!v.isRefund} onChange={set('isRefund')} /> Is refund?</label>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Add payment</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Amount (৳)" req><input type="number" step="0.01" min="0" className={inp} placeholder={String(total || 0)} value={v.paid ?? ''} onChange={set('paid')} /></Field>
              <Field label="Paid on" req><input type="date" className={inp} value={v.paidOn} onChange={set('paidOn')} /></Field>
              <Field label="Payment Method" req><select className={inp} value={v.method} onChange={set('method')}>{['Cash', 'Card', 'Cheque', 'Bank Transfer', 'bKash/Nagad', 'Other'].map(m => <option key={m}>{m}</option>)}</select></Field>
              <Field label="Payment note" wide><textarea rows={2} className={inp} value={v.payNote || ''} onChange={set('payNote')} /></Field>
            </div>
            <div className="mt-3 text-right text-sm font-bold text-slate-700">Payment due: <span className="text-rose-600">৳{Math.max(0, total - paid).toFixed(2)}</span></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Close</button>
          <button type="submit" className="rounded-xl bg-[#4a1fb8] px-6 py-2 text-sm font-bold text-white hover:bg-[#3d18a0]">Save</button>
        </div>
      </form>
    </div>
  );
};
