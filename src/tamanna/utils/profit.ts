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

/** Real-bill profit: what was sold minus what was bought minus expenses, from the full bill totals. */
export function billTotals(sales: Sale[], purchases: { grandTotal: number; paymentDue: number }[], expenses: Expense[]) {
  const live = sales.filter(s => s.type !== 'draft');
  const sold = live.reduce((a, s) => a + (Number(s.totalAmount) || 0), 0);
  const bought = purchases.reduce((a, p) => a + (Number(p.grandTotal) || 0), 0);
  const spent = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const receivable = live.reduce((a, s) => a + (Number(s.invoiceDue) || 0), 0);
  const payable = purchases.reduce((a, p) => a + (Number(p.paymentDue) || 0), 0);
  return { sold, bought, spent, profit: sold - bought - spent, receivable, payable, netDue: receivable - payable };
}

export interface ProductLine { productId: string; name: string; qty: number; soldAmount: number; costAmount: number; profit: number; }

/** Per-product sold / cost / profit from bills that carry item lines (uses the actual price on the bill). */
export function productBreakdown(sales: Sale[]): ProductLine[] {
  const map = new Map<string, ProductLine>();
  for (const s of sales) {
    if (s.type === 'draft' || !s.items) continue;
    for (const it of s.items) {
      if (!it?.product) continue;
      const price = (it.customPrice ?? it.product.sellingPrice) * (1 - (it.discountPercent || 0) / 100);
      const sold = price * it.quantity;
      const cost = (it.product.unitPurchasePrice || 0) * it.quantity;
      const row = map.get(it.product.id) || { productId: it.product.id, name: it.product.name, qty: 0, soldAmount: 0, costAmount: 0, profit: 0 };
      row.qty += it.quantity; row.soldAmount += sold; row.costAmount += cost; row.profit += sold - cost;
      map.set(it.product.id, row);
    }
  }
  return [...map.values()].sort((a, b) => b.soldAmount - a.soldAmount);
}
