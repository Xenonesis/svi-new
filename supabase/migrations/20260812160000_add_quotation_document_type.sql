-- Add 'quotation' to the documents_document_type_check constraint

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_document_type_check 
  CHECK (document_type IN ('allotment_letter', 'payment_receipt', 'payment_plan', 'offer_letter', 'bba', 'quotation'));
