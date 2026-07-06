-- Create careers table
CREATE TABLE IF NOT EXISTS public.careers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  type        text NOT NULL DEFAULT 'Onsite',
  salary      text NOT NULL,
  description text,
  icon        text NOT NULL DEFAULT 'Briefcase',
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- Public read policy: anyone can read active listings
CREATE POLICY "careers_public_read"
  ON public.careers
  FOR SELECT
  USING (is_active = true);

-- Admin full access (service role bypasses RLS, but this covers authenticated admin)
CREATE POLICY "careers_admin_all"
  ON public.careers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Seed some default careers to mirror the current hardcoded data
INSERT INTO public.careers (title, type, salary, icon, sort_order) VALUES
  ('Business Development Manager', 'Onsite', 'Up to ₹40,000/mo', 'Briefcase', 1),
  ('Business Development Executive', 'Onsite', 'Up to ₹30,000/mo', 'Users', 2),
  ('Team Leader', 'Onsite', 'Up to ₹60,000/mo', 'Target', 3);
