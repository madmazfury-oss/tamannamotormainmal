import { Product, Sale, Expense } from '../types';

/** Parses ISO dates and the imported "DD-MM-YYYY hh:mm AM" format. */
export function parseSaleDate(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
  if (m) {
    let h = parseInt(m[4] || '0', 10);
    if (m[6]) { const pm = m[6].toUpperCase() === 'PM'; if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
    return new Date(+m[3], +m[2] - 1, +m[1], h, parseInt(m[5] || '0', 10));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Average margin ratio of the product catalogue, used when a sale has no item lines. */
export function catalogueMargin(products: Product[]): number {
  let sell = 0, cost = 0;
  for (const p of products) if (p.sellingPrice > 0 && p.unitPurchasePrice > 0) { sell += p.sellingPrice; cost += p.unitPurchasePrice; }
  return sell > 0 ? (sell - cost) / sell : 0;
}

export function saleProfit(sale: Sale, margin: number): { profit: number; exact: boolean } {
  if (sale.items && sale.items.length) {
    let p = 0;
    for (const it of sale.items) {
      const price = it.customPrice ?? it.product.sellingPrice;
      const net = price * (1 - (it.discountPercent || 0) / 100);
      p += (net - (it.product.unitPurchasePrice || 0)) * it.quantity;
    }
    return { profit: p - (sale.discountAmount || 0), exact: true };
  }
  return { profit: (sale.totalAmount || 0) * margin, exact: false };
}

export interface ProfitSummary { sales: number; grossProfit: number; expenses: number; netProfit: number; invoices: number; estimated: number; }

export function profitBetween(sales: Sale[], expenses: Expense[], products: Product[], from: Date, to: Date): ProfitSummary {
  const margin = catalogueMargin(products);
  const r: ProfitSummary = { sales: 0, grossProfit: 0, expenses: 0, netProfit: 0, invoices: 0, estimated: 0 };
  for (const s of sales) {
    if (s.type === 'draft') continue;
    const d = parseSaleDate(s.saleDate);
    if (!d || d < from || d > to) continue;
    const { profit, exact } = saleProfit(s, margin);
    r.sales += s.totalAmount || 0; r.grossProfit += profit; r.invoices++; if (!exact) r.estimated++;
  }
  for (const e of expenses) {
    const d = parseSaleDate(e.expenseDate);
    if (d && d >= from && d <= to) r.expenses += e.amount || 0;
  }
  r.netProfit = r.grossProfit - r.expenses;
  return r;
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
