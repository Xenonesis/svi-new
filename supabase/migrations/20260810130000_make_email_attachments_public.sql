-- Ensure the email-attachments bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('email-attachments', 'email-attachments', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public read access to email-attachments bucket objects
DROP POLICY IF EXISTS "Public Access to email-attachments bucket" ON storage.objects;
CREATE POLICY "Public Access to email-attachments bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'email-attachments');
