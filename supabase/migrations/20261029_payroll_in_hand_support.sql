ALTER TABLE public.employee_salary_structures
ADD COLUMN IF NOT EXISTS salary_type TEXT NOT NULL DEFAULT 'ctc';

ALTER TABLE public.payroll_items
ADD COLUMN IF NOT EXISTS salary_type TEXT NOT NULL DEFAULT 'ctc';

UPDATE public.employee_salary_structures ess
SET salary_type = 'in_hand', professional_tax = 0
FROM public.documents d
WHERE d.document_type = 'offer_letter'
  AND d.form_data->>'salaryType' = 'in_hand'
  AND (
    LOWER(TRIM(COALESCE(d.form_data->>'emailId', ''))) = LOWER(TRIM(COALESCE((SELECT email FROM public.profiles WHERE id = ess.user_id), '')))
    OR LOWER(REGEXP_REPLACE(COALESCE(d.form_data->>'name', ''), '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(COALESCE((SELECT full_name FROM public.profiles WHERE id = ess.user_id), ''), '[^a-zA-Z0-9]', '', 'g'))
  );
