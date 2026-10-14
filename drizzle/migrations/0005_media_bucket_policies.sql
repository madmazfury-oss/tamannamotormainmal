CREATE POLICY "media public read" ON storage.objects FOR SELECT USING (bucket_id = 'tamanna-media');
CREATE POLICY "media signed-in upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tamanna-media');
CREATE POLICY "media signed-in update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tamanna-media');