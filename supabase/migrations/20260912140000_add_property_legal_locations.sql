-- Migration: Add legal location columns to properties table for BBA & Allotment document generation
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS legal_location_hi text,
ADD COLUMN IF NOT EXISTS legal_location_en text;

-- Comment on columns
COMMENT ON COLUMN public.properties.legal_location_hi IS 'Hindi legal land location description for Builder-Buyer Agreements and Allotment Letters';
COMMENT ON COLUMN public.properties.legal_location_en IS 'English legal land location description for Builder-Buyer Agreements and Allotment Letters';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
