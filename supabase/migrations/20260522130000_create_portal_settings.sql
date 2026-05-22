-- Create portal_settings table to store global and user-specific configurations
CREATE TABLE IF NOT EXISTS public.portal_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can read all settings" ON public.portal_settings;
DROP POLICY IF EXISTS "Admins can modify settings" ON public.portal_settings;
DROP POLICY IF EXISTS "Service role full access" ON public.portal_settings;

-- Policy: Admins can read settings
CREATE POLICY "Admins can read all settings"
  ON public.portal_settings FOR SELECT
  USING (public.is_admin());

-- Policy: Admins can perform inserts, updates, and deletes
CREATE POLICY "Admins can modify settings"
  ON public.portal_settings FOR ALL
  USING (public.is_admin());

-- Policy: Service role full access (bypassing RLS)
CREATE POLICY "Service role full access"
  ON public.portal_settings FOR ALL
  USING (auth.role() = 'service_role');

-- Attach trigger to update the updated_at timestamp automatically
DROP TRIGGER IF EXISTS portal_settings_updated_at ON public.portal_settings;
CREATE TRIGGER portal_settings_updated_at
  BEFORE UPDATE ON public.portal_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
