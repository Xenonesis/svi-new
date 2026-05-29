-- Create properties table to dynamically manage projects/properties in SVI Infra
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can read active properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can modify properties" ON public.properties;

-- Policy: Anyone can read active properties (for public select dropdowns)
CREATE POLICY "Anyone can read active properties"
  ON public.properties FOR SELECT
  USING (active = true OR (auth.role() = 'authenticated' AND public.is_admin()));

-- Policy: Only admins can perform write/modify operations
CREATE POLICY "Admins can modify properties"
  ON public.properties FOR ALL
  USING (public.is_admin());

-- Attach handle_updated_at trigger if it exists (usually handles updated_at, but we don't have updated_at yet. Let's add it)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Pre-populate active properties from hardcoded values currently in the app
INSERT INTO public.properties (name, slug, active) VALUES
  ('Shyam Aangan Phase 1', 'shyam-aangan-phase-1', true),
  ('Shyam Aangan Farm House', 'shyam-aangan-farm-house', true),
  ('Shivani Vatika', 'shivani-vatika', true),
  ('Shyam Aangan', 'shyam-aangan', true)
ON CONFLICT (name) DO UPDATE SET 
  slug = EXCLUDED.slug,
  active = EXCLUDED.active,
  updated_at = now();
