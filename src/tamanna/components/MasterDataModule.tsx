import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Lock } from 'lucide-react';
import { CloudCollections } from '../data/firestoreSync';
import { Language } from '../i18n/translations';

export interface FieldDef {
  key: string;
  en: string;
  bn: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date';
  options?: string[];
  required?: boolean;
}

export interface ModuleDef {
  collection: string;
  en: string;
  bn: string;
  subEn: string;
  subBn: string;
  fields: FieldDef[];
  seed?: Record<string, any>[];
}

const f = (key: string, en: string, bn: string, extra: Partial<FieldDef> = {}): FieldDef => ({ key, en, bn, ...extra });

export const MODULES: Record<string, ModuleDef> = {
  'commission-agents': {
    collection: 'commission_agents', en: 'Sales Commission Agents', bn: 'সেলস কমিশন এজেন্ট',
    subEn: 'Agents who earn a commission on sales.', subBn: 'বিক্রয়ের উপর কমিশন পাওয়া এজেন্ট।',
    fields: [f('prefix', 'Prefix', 'উপাধি', { options: ['Mr', 'Mrs', 'Ms'], type: 'select' }), f('name', 'Name', 'নাম', { required: true }), f('email', 'Email', 'ইমেইল'), f('phone', 'Contact No', 'মোবাইল'), f('address', 'Address', 'ঠিকানা'), f('commission', 'Commission %', 'কমিশন %', { type: 'number' })],
  },
  'products-variations': {
    collection: 'variations', en: 'Variations', bn: 'ভ্যারিয়েশন',
    subEn: 'Manage product variations (size, color, model…).', subBn: 'পণ্যের ভ্যারিয়েশন (সাইজ, রং, মডেল…)।',
    fields: [f('name', 'Variation', 'ভ্যারিয়েশন', { required: true }), f('values', 'Values (comma separated)', 'মানসমূহ (কমা দিয়ে)', { required: true })],
  },
  'products-units': {
    collection: 'units', en: 'Units', bn: 'ইউনিট',
    subEn: 'Manage your units.', subBn: 'পরিমাপের ইউনিট।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('shortName', 'Short name', 'সংক্ষিপ্ত নাম', { required: true }), f('allowDecimal', 'Allow decimal', 'দশমিক অনুমতি', { type: 'select', options: ['No', 'Yes'] })],
    seed: [{ id: 'u-pcs', name: 'Pieces', shortName: 'Pc(s)', allowDecimal: 'No' }],
  },
  'products-categories': {
    collection: 'categories', en: 'Categories', bn: 'ক্যাটাগরি',
    subEn: 'Manage your categories.', subBn: 'পণ্যের ক্যাটাগরি।',
    fields: [f('name', 'Category name', 'ক্যাটাগরির নাম', { required: true }), f('code', 'Category code', 'কোড'), f('description', 'Description', 'বিবরণ', { type: 'textarea' }), f('parent', 'Parent category', 'মূল ক্যাটাগরি')],
  },
  'products-brands': {
    collection: 'brands', en: 'Brands', bn: 'ব্র্যান্ড',
    subEn: 'Manage your brands.', subBn: 'ব্র্যান্ড সমূহ।',
    fields: [f('name', 'Brand name', 'ব্র্যান্ডের নাম', { required: true }), f('description', 'Short description', 'সংক্ষিপ্ত বিবরণ')],
  },
  'products-warranties': {
    collection: 'warranties', en: 'Warranties', bn: 'ওয়ারেন্টি',
    subEn: 'Warranty policies for products.', subBn: 'পণ্যের ওয়ারেন্টি পলিসি।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('description', 'Description', 'বিবরণ'), f('duration', 'Duration', 'মেয়াদ', { type: 'number', required: true }), f('durationType', 'Duration type', 'মেয়াদের ধরন', { type: 'select', options: ['Days', 'Months', 'Years'] })],
  },
  'sales-shipments': {
    collection: 'shipments', en: 'Shipments', bn: 'শিপমেন্ট',
    subEn: 'Track deliveries of sales.', subBn: 'বিক্রয়ের ডেলিভারি ট্র্যাকিং।',
    fields: [f('date', 'Date', 'তারিখ', { type: 'date' }), f('invoiceNo', 'Invoice No.', 'ইনভয়েস নং', { required: true }), f('customer', 'Customer', 'গ্রাহক'), f('address', 'Shipping address', 'ঠিকানা'), f('deliveredTo', 'Delivered to', 'যাকে দেওয়া হয়েছে'), f('charges', 'Shipping charges', 'শিপিং চার্জ', { type: 'number' }), f('status', 'Shipping status', 'অবস্থা', { type: 'select', options: ['Ordered', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] })],
  },
  'sales-discounts': {
    collection: 'discounts', en: 'Discounts', bn: 'ডিসকাউন্ট',
    subEn: 'Discount rules for products, brands or categories.', subBn: 'পণ্য/ব্র্যান্ড/ক্যাটাগরির ডিসকাউন্ট।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('brand', 'Brand', 'ব্র্যান্ড'), f('category', 'Category', 'ক্যাটাগরি'), f('priority', 'Priority', 'অগ্রাধিকার', { type: 'number' }), f('discountType', 'Discount type', 'ডিসকাউন্টের ধরন', { type: 'select', options: ['Fixed', 'Percentage'] }), f('amount', 'Discount amount', 'পরিমাণ', { type: 'number', required: true }), f('startsAt', 'Starts at', 'শুরু', { type: 'date' }), f('endsAt', 'Ends at', 'শেষ', { type: 'date' })],
  },
  'expense-categories': {
    collection: 'expense_categories', en: 'Expense Categories', bn: 'খরচের ক্যাটাগরি',
    subEn: 'Manage your expense categories.', subBn: 'খরচের ক্যাটাগরি।',
    fields: [f('name', 'Category name', 'ক্যাটাগরির নাম', { required: true }), f('code', 'Category code', 'কোড')],
    seed: ['Rent', 'Utilities', 'Salaries', 'Logistics', 'Marketing', 'Maintenance', 'Office Supplies'].map(n => ({ id: `ec-${n.toLowerCase().replace(/\s/g, '-')}`, name: n, code: '' })),
  },
  'settings-locations': {
    collection: 'business_locations', en: 'Business Locations', bn: 'ব্যবসায়িক শাখা',
    subEn: 'Manage your business locations.', subBn: 'ব্যবসার শাখাসমূহ।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('locationId', 'Location ID', 'লোকেশন আইডি'), f('landmark', 'Landmark', 'ল্যান্ডমার্ক'), f('city', 'City', 'শহর'), f('zip', 'Zip code', 'জিপ কোড'), f('state', 'State', 'জেলা'), f('country', 'Country', 'দেশ'), f('mobile', 'Mobile', 'মোবাইল'), f('email', 'Email', 'ইমেইল')],
    seed: [{ id: 'loc-bl0001', name: 'TAMANNA MOTORS', locationId: 'BL0001', landmark: 'Hazigonj', city: 'Hazigonj', zip: '', state: 'Chandpur', country: 'Bangladesh', mobile: '', email: '' }],
  },
  'settings-barcodes': {
    collection: 'barcode_settings', en: 'Barcode Settings', bn: 'বারকোড সেটিংস',
    subEn: 'Sticker sheet sizes for label printing.', subBn: 'লেবেল প্রিন্টের স্টিকার মাপ।',
    fields: [f('name', 'Sticker sheet setting name', 'সেটিংয়ের নাম', { required: true }), f('description', 'Description', 'বিবরণ'), f('width', 'Width of sticker (inch)', 'প্রস্থ (ইঞ্চি)', { type: 'number' }), f('height', 'Height of sticker (inch)', 'উচ্চতা (ইঞ্চি)', { type: 'number' }), f('perRow', 'Stickers in one row', 'প্রতি সারিতে', { type: 'number' }), f('perSheet', 'No. of stickers per sheet', 'প্রতি শিটে', { type: 'number' })],
  },
  'settings-printers': {
    collection: 'printers', en: 'Receipt Printers', bn: 'রসিদ প্রিন্টার',
    subEn: 'Printers used for receipts.', subBn: 'রসিদ প্রিন্টার।',
    fields: [f('name', 'Printer name', 'প্রিন্টারের নাম', { required: true }), f('connection', 'Connection type', 'সংযোগ', { type: 'select', options: ['Browser', 'Network', 'Windows', 'Linux'] }), f('capability', 'Capability profile', 'প্রোফাইল', { type: 'select', options: ['Default', 'Simple', 'SP2000', 'Star Branded', 'Espon Tep'] }), f('charsPerLine', 'Characters per line', 'প্রতি লাইনে অক্ষর', { type: 'number' }), f('ip', 'IP address', 'আইপি'), f('port', 'Port', 'পোর্ট')],
  },
  'settings-tax-rates': {
    collection: 'tax_rates', en: 'Tax Rates', bn: 'ট্যাক্স রেট',
    subEn: 'Manage your tax rates.', subBn: 'ট্যাক্স রেট।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('rate', 'Tax rate %', 'হার %', { type: 'number', required: true })],
  },
  'selling-price-group': {
    collection: 'selling_price_groups', en: 'Selling Price Group', bn: 'বিক্রয় মূল্য গ্রুপ',
    subEn: 'Different selling prices for customer groups.', subBn: 'গ্রাহক গ্রুপভিত্তিক বিক্রয় মূল্য।',
    fields: [f('name', 'Name', 'নাম', { required: true }), f('description', 'Description', 'বিবরণ')],
  },
  'notification-templates': {
    collection: 'notification_templates', en: 'Notification Templates', bn: 'নোটিফিকেশন টেমপ্লেট',
    subEn: 'SMS / email message templates sent to customers.', subBn: 'গ্রাহকদের SMS/ইমেইল বার্তার টেমপ্লেট।',
    fields: [f('name', 'Template for', 'কিসের জন্য', { type: 'select', options: ['New Sale', 'Payment Received', 'Payment Reminder', 'New Booking', 'New Order', 'Payment Paid (Supplier)'], required: true }), f('channel', 'Channel', 'মাধ্যম', { type: 'select', options: ['SMS', 'Email', 'WhatsApp'] }), f('subject', 'Subject', 'বিষয়'), f('body', 'Message ({contact_name}, {invoice_number}, {total_amount}, {due_amount})', 'বার্তা', { type: 'textarea', required: true })],
  },
};

interface Props {
  route: string;
  lang: Language;
  canEdit: boolean;
  onDeleteLog: (entityType: string, obj: any) => void;
}

export const MasterDataModule: React.FC<Props> = ({ route, lang, canEdit, onDeleteLog }) => {
  const def = MODULES[route];
  const bn = lang === 'bn';
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    setLoaded(false);
    const unsub = CloudCollections.subscribe<Record<string, any>>(def.collection, (items) => {
      setRows(items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))));
      setLoaded(true);
    });
    return unsub;
  }, [def.collection]);

  // first-time defaults
  useEffect(() => {
    if (loaded && rows.length === 0 && def.seed) def.seed.forEach(s => CloudCollections.upsert(def.collection, s.id, { ...s, createdAt: new Date().toISOString() }));
  }, [loaded]); // eslint-disable-line

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => def.fields.some(fd => String(r[fd.key] ?? '').toLowerCase().includes(s)));
  }, [rows, q, def]);

  const cols = def.fields.filter(fd => fd.type !== 'textarea').slice(0, 6);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const id = editing.id || `${def.collection}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const data = { ...editing, id, createdAt: editing.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    setRows(prev => [data, ...prev.filter(r => r.id !== id)]);
    setEditing(null);
    await CloudCollections.upsert(def.collection, id, data);
  };

  const remove = async (row: Record<string, any>) => {
    if (!canEdit) return;
    if (!confirm(bn ? `"${row.name || row.id}" মুছে ফেলবেন?` : `Delete "${row.name || row.id}"?`)) return;
    onDeleteLog(def.en, row);
    setRows(prev => prev.filter(r => r.id !== row.id));
    await CloudCollections.remove(def.collection, row.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{bn ? def.bn : def.en}</h1>
          <p className="text-sm text-slate-500">{bn ? def.subBn : def.subEn}</p>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4a1fb8] to-[#6d3df0] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:opacity-95">
          <Plus className="h-4 w-4" /> {bn ? 'নতুন যোগ করুন' : 'Add'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 p-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={bn ? 'খুঁজুন…' : 'Search…'} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#4a1fb8]" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} {bn ? 'টি' : 'entries'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {cols.map(c => <th key={c.key} className="px-4 py-3 font-semibold">{bn ? c.bn : c.en}</th>)}
                <th className="px-4 py-3 text-right font-semibold">{bn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {!loaded && <tr><td colSpan={cols.length + 1} className="px-4 py-8 text-center text-slate-400">{bn ? 'লোড হচ্ছে…' : 'Loading…'}</td></tr>}
              {loaded && filtered.length === 0 && <tr><td colSpan={cols.length + 1} className="px-4 py-10 text-center text-slate-400">{bn ? 'কোনো তথ্য নেই — "নতুন যোগ করুন" চাপুন' : 'No data yet — click "Add"'}</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-violet-50/40 dark:hover:bg-slate-800/40">
                  {cols.map((c, i) => <td key={c.key} className={`px-4 py-3 ${i === 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{String(r[c.key] ?? '—') || '—'}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {canEdit ? (
                        <>
                          <button onClick={() => setEditing({ ...r })} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => remove(r)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </>
                      ) : <span title={bn ? 'শুধু সুপার অ্যাডমিন' : 'Super Admin only'}><Lock className="h-3.5 w-3.5 text-slate-300" /></span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#4a1fb8] to-[#6d3df0] px-5 py-4 text-white">
              <h2 className="text-lg font-bold">{editing.id ? (bn ? 'এডিট করুন' : 'Edit') : (bn ? 'নতুন যোগ করুন' : 'Add')} — {bn ? def.bn : def.en}</h2>
              <button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
              {def.fields.map(fd => {
                const cls = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-[#4a1fb8] focus:ring-2 focus:ring-violet-200';
                const v = editing[fd.key] ?? '';
                const set = (val: any) => setEditing(p => ({ ...p!, [fd.key]: val }));
                return (
                  <label key={fd.key} className={`block ${fd.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                    <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{bn ? fd.bn : fd.en}{fd.required && <span className="text-rose-500"> *</span>}</span>
                    {fd.type === 'select' ? (
                      <select required={fd.required} value={v} onChange={e => set(e.target.value)} className={cls}>
                        <option value="">{bn ? 'নির্বাচন করুন' : 'Please select'}</option>
                        {fd.options!.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : fd.type === 'textarea' ? (
                      <textarea required={fd.required} rows={4} value={v} onChange={e => set(e.target.value)} className={cls} />
                    ) : (
                      <input required={fd.required} type={fd.type || 'text'} value={v} onChange={e => set(fd.type === 'number' ? e.target.value : e.target.value)} className={cls} />
                    )}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 p-4">
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">{bn ? 'বাতিল' : 'Close'}</button>
              <button type="submit" className="rounded-xl bg-[#4a1fb8] px-5 py-2 text-sm font-bold text-white hover:bg-[#3d18a0]">{bn ? 'সংরক্ষণ' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
