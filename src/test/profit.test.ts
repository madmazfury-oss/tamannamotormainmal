import { describe, it, expect } from 'vitest';
import { parseSaleDate, profitBetween } from '@/tamanna/utils/profit';

const prod: any = { id: 'p', name: 'Chain', sellingPrice: 700, unitPurchasePrice: 500 };

describe('profit report', () => {
  it('parses imported DD-MM-YYYY hh:mm PM dates', () => {
    const d = parseSaleDate('26-09-2025 07:22 PM')!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2025, 8, 26, 19]);
  });
  it('daily net profit = (price - cost) x qty minus that day expenses', () => {
    const sale: any = { type: 'pos', totalAmount: 1400, saleDate: '2026-10-14T10:00:00', items: [{ product: prod, quantity: 2 }] };
    const exp: any = { amount: 100, expenseDate: '2026-10-14' };
    const r = profitBetween([sale], [exp], [prod], new Date(2026, 9, 14), new Date(2026, 9, 14, 23, 59, 59));
    expect(r.grossProfit).toBe(400);
    expect(r.netProfit).toBe(300);
  });
});
