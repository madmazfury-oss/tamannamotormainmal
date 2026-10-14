CREATE TABLE IF NOT EXISTS public.sync_documents (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (collection, id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_documents TO anon, authenticated;
GRANT ALL ON public.sync_documents TO service_role;

ALTER TABLE public.sync_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to sync_documents" ON public.sync_documents FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_documents;