ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_qty numeric;
UPDATE public.products SET stock_qty = current_stock WHERE stock_qty IS NULL;
COMMENT ON COLUMN public.products.current_stock IS 'DEPRECATED: replaced by stock_qty (supports loose gram/litre stock)';