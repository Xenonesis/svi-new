-- Create public assets bucket for large video files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true) 
ON CONFLICT (id) DO NOTHING;

-- Public read access to assets bucket
DROP POLICY IF EXISTS "Public Access to assets bucket" ON storage.objects;
CREATE POLICY "Public Access to assets bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'assets');
