import React, { useMemo, useState, useEffect } from 'react';
import { X, ShoppingBag, Search, Trash2 } from 'lucide-react';
import { Purchase, Contact, Product } from '../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Contact[];
  products?: Product[];
  onAddPurchase: (purchase: Purchase) => void;
}

interface Line { productId: string; productName: string; sku: string; quantity: number; unitCost: number; discountPct: number; sellingPrice: number; }

const inp = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#4a1fb8] focus:ring-2 focus:ring-violet-200';
const F: React.FC<{ l: string; r?: boolean; children: React.ReactNode }> = ({ l, r, children }) => (
  <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{l}{r && <span className="text-rose-500"> *</span>}</span>{children}</label>
);

export const lineTotal = (l: { quantity: number; unitCost: number; discountPct: number }) => l.quantity * l.unitCost * (1 - (l.discountPct || 0) / 100);

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({ isOpen, onClose, suppliers, products = [], onAddPurchase }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [supplier, setSupplier] = useState('');
  const [ref, setRef] = useState('');
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<'Received' | 'Pending' | 'Ordered'>('Received');
  const [lines, setLines] = useState<Line[]>([]);
  const [q, setQ] = useState('');
  const [discType, setDiscType] = useState<'None' | 'Fixed' | 'Percentage'>('None');
  const [disc, setDisc] = useState('');
  const [shipping, setShipping] = useState('');
  const [note, setNote] = useState('');
  const [paid, setPaid] = useState('');
  const [method, setMethod] = useState('Cash');

  useEffect(() => { if (isOpen) { setLines([]); setQ(''); setPaid(''); setRef(''); setDisc(''); setShipping(''); setNote(''); setSupplier(''); } }, [isOpen]);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 1) return [];
    return products.filter(p => p.name.toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s)).slice(0, 8);
  }, [q, products]);

  if (!isOpen) return null;

  const addLine = (p: Product) => {
    setLines(prev => prev.some(l => l.productId === p.id)
      ? prev.map(l => l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l)
      : [...prev, { productId: p.id, productName: p.name, sku: p.sku, quantity: 1, unitCost: p.unitPurchasePrice || 0, discountPct: 0, sellingPrice: p.sellingPrice || 0 }]);
    setQ('');
  };
  const upd = (i: number, k: keyof Line, val: string) => setLines(prev => prev.map((l, j) => j === i ? { ...l, [k]: parseFloat(val) || 0 } : l));

  const net = lines.reduce((s, l) => s + lineTotal(l), 0);
  const d = parseFloat(disc) || 0;
  const discAmt = discType === 'Fixed' ? d : discType === 'Percentage' ? net * d / 100 : 0;
  const grand = Math.max(0, net - discAmt + (parseFloat(shipping) || 0));
  const paidNum = paid === '' ? grand : parseFloat(paid) || 0;
  const due = Math.max(0, grand - paidNum);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return alert('Please select a supplier');
    if (!lines.length) return alert('Please add at least one product');
    const p: any = {
      id: `pur-${Date.now()}`, purchaseNo: ref.trim() || `PO${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: supplier, businessLocation: 'Hazigonj Branch', purchaseStatus: status,
      paymentStatus: due <= 0 ? 'Paid' : paidNum > 0 ? 'Partial' : 'Due', purchaseDate: date,
      grandTotal: +grand.toFixed(2), paymentDue: +due.toFixed(2), itemsCount: lines.reduce((s, l) => s + l.quantity, 0),
      items: lines, discountType: discType, discountAmount: +discAmt.toFixed(2), shippingCharges: parseFloat(shipping) || 0,
      additionalNotes: note, paymentMethod: method, amountPaid: +paidNum.toFixed(2),
    };
    onAddPurchase(p as Purchase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#4a1fb8] to-[#6d3df0] px-5 py-4 text-white">
          <div className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /><h3 className="text-lg font-bold">Add Purchase</h3></div>
          <button type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <F l="Supplier" r><select required className={inp} value={supplier} onChange={e => setSupplier(e.target.value)}><option value="">Please select</option>{suppliers.map(s => { const n = s.businessName || s.name; return <option key={s.id} value={n}>{n}</option>; })}</select></F>
            <F l="Reference No"><input className={inp} placeholder="Auto" value={ref} onChange={e => setRef(e.target.value)} /></F>
            <F l="Purchase Date" r><input type="date" required className={inp} value={date} onChange={e => setDate(e.target.value)} /></F>
            <F l="Purchase Status" r><select className={inp} value={status} onChange={e => setStatus(e.target.value as any)}><option>Received</option><option>Pending</option><option>Ordered</option></select></F>
            <F l="Business Location" r><select className={inp}><option>Hazigonj Branch</option></select></F>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className={`${inp} pl-9`} placeholder="Enter product name / SKU" value={q} onChange={e => setQ(e.target.value)} />
              {matches.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {matches.map(p => <button type="button" key={p.id} onClick={() => addLine(p)} className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-violet-50"><span>{p.name} <span className="text-xs text-slate-400">{p.sku}</span></span><span className="text-xs text-slate-500">Stock: {p.currentStock}</span></button>)}
                </div>
              )}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-violet-600 text-xs text-white"><tr>
                  <th className="px-2 py-2 text-left">Product Name</th><th className="px-2 py-2">Purchase Quantity</th><th className="px-2 py-2">Unit Cost</th><th className="px-2 py-2">Discount %</th><th className="px-2 py-2">Line Total</th><th className="px-2 py-2">Selling Price</th><th></th>
                </tr></thead>
                <tbody>
                  {lines.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-400">No products added</td></tr>}
                  {lines.map((l, i) => (
                    <tr key={l.productId} className="border-t border-slate-100">
                      <td className="px-2 py-2 font-medium">{l.productName}<div className="text-xs text-slate-400">{l.sku}</div></td>
                      {(['quantity', 'unitCost', 'discountPct'] as const).map(k => <td key={k} className="px-2 py-2"><input type="number" step="any" min="0" className={`${inp} w-24`} value={l[k]} onChange={e => upd(i, k, e.target.value)} /></td>)}
                      <td className="px-2 py-2 text-right font-mono">৳{lineTotal(l).toFixed(2)}</td>
                      <td className="px-2 py-2"><input type="number" step="any" min="0" className={`${inp} w-24`} value={l.sellingPrice} onChange={e => upd(i, 'sellingPrice', e.target.value)} /></td>
                      <td className="px-2 py-2"><button type="button" onClick={() => setLines(p => p.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-rose-500" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-sm">Total Items: <b>{lines.reduce((s, l) => s + l.quantity, 0)}</b> &nbsp; Net Total Amount: <b>৳{net.toFixed(2)}</b></div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <F l="Discount Type"><select className={inp} value={discType} onChange={e => setDiscType(e.target.value as any)}><option>None</option><option>Fixed</option><option>Percentage</option></select></F>
            <F l="Discount Amount"><input type="number" step="any" min="0" className={inp} value={disc} onChange={e => setDisc(e.target.value)} /></F>
            <F l="Shipping Charges (৳)"><input type="number" step="any" min="0" className={inp} value={shipping} onChange={e => setShipping(e.target.value)} /></F>
            <F l="Additional Notes"><input className={inp} value={note} onChange={e => setNote(e.target.value)} /></F>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h4 className="mb-3 text-sm font-bold">Add payment</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <F l="Amount (৳)" r><input type="number" step="any" min="0" className={inp} placeholder={grand.toFixed(2)} value={paid} onChange={e => setPaid(e.target.value)} /></F>
              <F l="Payment Method" r><select className={inp} value={method} onChange={e => setMethod(e.target.value)}>{['Cash', 'Card', 'Cheque', 'Bank Transfer', 'bKash/Nagad', 'Other'].map(m => <option key={m}>{m}</option>)}</select></F>
              <div className="flex flex-col items-end justify-end text-sm">
                <div>Purchase Total: <b>৳{grand.toFixed(2)}</b></div>
                <div>Payment due: <b className="text-rose-600">৳{due.toFixed(2)}</b></div>
              </div>
            </div>
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
