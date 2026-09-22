-- Allow public to read announcement_bar setting from portal_settings
DROP POLICY IF EXISTS "Public can read announcement bar" ON public.portal_settings;
CREATE POLICY "Public can read announcement bar"
  ON public.portal_settings FOR SELECT
  USING (key = 'announcement_bar');
