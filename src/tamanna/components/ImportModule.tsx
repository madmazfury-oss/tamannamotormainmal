import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FirestoreSync } from '../data/firestoreSync';
import { Language } from '../i18n/translations';
import { Product, Contact, Sale } from '../types';

export type ImportKind = 'products' | 'opening-stock' | 'contacts' | 'sales';

const COLUMNS: Record<ImportKind, string[]> = {
  products: ['name', 'sku', 'category', 'purchase_price', 'selling_price', 'opening_stock', 'alert_quantity'],
  'opening-stock': ['sku', 'quantity', 'purchase_price'],
  contacts: ['type', 'name', 'business_name', 'phone', 'email', 'address', 'opening_balance'],
  sales: ['invoice_no', 'date', 'customer_name', 'customer_phone', 'total_amount', 'paid_amount'],
};

const TITLES: Record<ImportKind, [string, string]> = {
  products: ['Import Products', 'পণ্য ইমপোর্ট'],
  'opening-stock': ['Import Opening Stock', 'ওপেনিং স্টক ইমপোর্ট'],
  contacts: ['Import Contacts', 'কন্টাক্ট ইমপোর্ট'],
  sales: ['Import Sales', 'বিক্রয় ইমপোর্ট'],
};

/** Minimal CSV parser supporting quoted fields. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      cur.push(field); field = '';
      if (cur.some(x => x.trim() !== '')) rows.push(cur);
      cur = [];
    } else field += c;
  }
  cur.push(field);
  if (cur.some(x => x.trim() !== '')) rows.push(cur);
  if (rows.length < 2) return [];
  const head = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const num = (v: string) => { const n = parseFloat(String(v || '').replace(/[,৳\s]/g, '')); return isFinite(n) ? n : 0; };
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface Props { kind: ImportKind; lang: Language; products: Product[]; location: string; }

export const ImportModule: React.FC<Props> = ({ kind, lang, products, location }) => {
  const bn = lang === 'bn';
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: number; skipped: string[] } | null>(null);

  const template = () => {
    const blob = new Blob([COLUMNS[kind].join(',') + '\n'], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${kind}-template.csv`; a.click();
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setFileName(file.name); setResult(null);
    setRows(parseCsv(await file.text()));
  };

  const run = async () => {
    setBusy(true);
    let ok = 0; const skipped: string[] = [];
    const now = new Date().toISOString();
    for (const [i, r] of rows.entries()) {
      const line = i + 2;
      try {
        if (kind === 'products') {
          if (!r.name) { skipped.push(`#${line}: name missing`); continue; }
          const existing = products.find(p => r.sku && p.sku === r.sku);
          const p: Product = {
            id: existing?.id || uid('prod'), name: r.name, sku: r.sku || `SKU-${Date.now().toString().slice(-6)}${i}`,
            category: r.category || 'General', businessLocation: location,
            unitPurchasePrice: num(r.purchase_price), sellingPrice: num(r.selling_price),
            currentStock: num(r.opening_stock), alertQuantity: num(r.alert_quantity) || 5,
            imageUrl: existing?.imageUrl || '', createdAt: existing?.createdAt || now,
          };
          await FirestoreSync.upsertProduct(p);
        } else if (kind === 'opening-stock') {
          const p = products.find(x => x.sku === r.sku);
          if (!p) { skipped.push(`#${line}: SKU ${r.sku} not found`); continue; }
          await FirestoreSync.upsertProduct({ ...p, currentStock: (p.currentStock || 0) + num(r.quantity), unitPurchasePrice: r.purchase_price ? num(r.purchase_price) : p.unitPurchasePrice });
        } else if (kind === 'contacts') {
          if (!r.name) { skipped.push(`#${line}: name missing`); continue; }
          const type = (r.type || 'customer').toLowerCase().startsWith('s') ? 'supplier' : 'customer';
          const c: Contact = { id: uid('cnt'), type, name: r.name, businessName: r.business_name, phone: r.phone || '', email: r.email || '', address: r.address, businessLocation: location, balance: num(r.opening_balance) };
          await FirestoreSync.upsertContact(c);
        } else {
          if (!r.invoice_no) { skipped.push(`#${line}: invoice_no missing`); continue; }
          const total = num(r.total_amount), paid = r.paid_amount === '' || r.paid_amount == null ? total : num(r.paid_amount);
          const due = Math.max(0, total - paid);
          const s: Sale = {
            id: uid('sale'), invoiceNo: r.invoice_no, type: 'sale', customerName: r.customer_name || 'Walk-In Customer', customerPhone: r.customer_phone,
            businessLocation: location, paymentStatus: due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due', paymentMethod: 'Cash',
            totalAmount: total, invoiceDue: due, saleDate: r.date ? new Date(r.date).toISOString() : now, itemsCount: 0,
          };
          await FirestoreSync.upsertSale(s);
        }
        ok++;
      } catch (e) { skipped.push(`#${line}: ${(e as Error).message}`); }
    }
    setResult({ ok, skipped }); setBusy(false); setRows([]); setFileName('');
  };

  const cols = COLUMNS[kind];
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{TITLES[kind][bn ? 1 : 0]}</h1>
        <p className="text-sm text-slate-500">{bn ? 'CSV ফাইল আপলোড করে একসাথে অনেক তথ্য যোগ করুন।' : 'Upload a CSV file to add many records at once.'}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#4a1fb8] to-[#6d3df0] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
            <Upload className="h-4 w-4" /> {bn ? 'CSV ফাইল নির্বাচন' : 'Choose CSV file'}
            <input data-testid="import-file" type="file" accept=".csv,text/csv" className="hidden" onChange={e => onFile(e.target.files?.[0])} />
          </label>
          <button onClick={template} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> {bn ? 'টেমপ্লেট ডাউনলোড' : 'Download template'}
          </button>
          {fileName && <span className="text-sm text-slate-500">{fileName} — {rows.length} {bn ? 'সারি' : 'rows'}</span>}
        </div>
        <div className="rounded-xl bg-violet-50 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
          <b>{bn ? 'কলাম:' : 'Columns:'}</b> <span className="font-mono">{cols.join(', ')}</span>
        </div>
        {rows.length > 0 && (
          <>
            <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0"><tr>{cols.map(c => <th key={c} className="px-3 py-2 text-left">{c}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 50).map((r, i) => <tr key={i} className="border-t border-slate-100 dark:border-slate-800">{cols.map(c => <td key={c} className="px-3 py-1.5">{r[c]}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <button disabled={busy} onClick={run} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy ? (bn ? 'ইমপোর্ট হচ্ছে…' : 'Importing…') : (bn ? `${rows.length}টি সারি ইমপোর্ট করুন` : `Import ${rows.length} rows`)}
            </button>
          </>
        )}
        {result && (
          <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" /> {bn ? `${result.ok}টি সফলভাবে ইমপোর্ট হয়েছে` : `${result.ok} imported successfully`}</div>
            {result.skipped.map(s => <div key={s} className="flex items-center gap-2 text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{s}</div>)}
          </div>
        )}
      </div>
    </div>
  );
};
