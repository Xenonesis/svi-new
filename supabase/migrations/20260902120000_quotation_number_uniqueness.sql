-- Migration: Enforce quotation number uniqueness & provide atomic sequence generator
-- Date: 2026-09-02

-- 1. Create unique partial index on documents for quotation numbers to guarantee uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_quotation_number 
  ON public.documents ((form_data->>'quotationNo')) 
  WHERE document_type = 'quotation' AND form_data->>'quotationNo' IS NOT NULL;

-- 2. Create atomic database function to generate the next unique quotation number
CREATE OR REPLACE FUNCTION public.get_next_quotation_number(target_date text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date text;
  v_prefix text;
  v_max_seq int := 0;
  v_seq int;
  v_next_num text;
  r RECORD;
BEGIN
  IF target_date IS NULL OR target_date = '' THEN
    -- default to current date YYYYMMDD in IST (Asia/Kolkata)
    v_date := to_char(timezone('Asia/Kolkata', now()), 'YYYYMMDD');
  ELSE
    v_date := replace(target_date, '-', '');
  END IF;

  v_prefix := 'SVI-QTN-' || v_date || '-';

  -- Find highest sequence number for this date prefix from existing quotation documents
  FOR r IN 
    SELECT form_data->>'quotationNo' AS q_no 
    FROM public.documents 
    WHERE document_type = 'quotation' 
      AND form_data->>'quotationNo' LIKE v_prefix || '%'
  LOOP
    BEGIN
      v_seq := substring(r.q_no from length(v_prefix) + 1)::integer;
      IF v_seq > v_max_seq THEN
        v_max_seq := v_seq;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- ignore non-numeric suffix
    END;
  END LOOP;

  -- Generate candidate next number and ensure it doesn't collide with any existing quotation
  LOOP
    v_max_seq := v_max_seq + 1;
    v_next_num := v_prefix || lpad(v_max_seq::text, 4, '0');
    
    IF NOT EXISTS (
      SELECT 1 FROM public.documents 
      WHERE document_type = 'quotation' 
        AND form_data->>'quotationNo' = v_next_num
    ) THEN
      RETURN v_next_num;
    END IF;
  END LOOP;
END;
$$;
