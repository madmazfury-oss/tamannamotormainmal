import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/tamanna/components/ImportModule';

describe('parseCsv', () => {
  it('reads headers and quoted values', () => {
    const rows = parseCsv('Name,SKU,Selling Price\n"Brake, Front",BP-1,450\nChain,CH-2,900\n');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Brake, Front', sku: 'BP-1', selling_price: '450' });
  });
});
