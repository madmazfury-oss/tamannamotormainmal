import { describe, it, expect } from 'vitest';
import { lineTotal } from '@/tamanna/components/AddPurchaseModal';

describe('purchase line total', () => {
  it('applies quantity, unit cost and discount %', () => {
    expect(lineTotal({ quantity: 4, unitCost: 250, discountPct: 10 })).toBe(900);
  });
});
