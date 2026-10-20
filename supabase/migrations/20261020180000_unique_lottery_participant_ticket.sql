-- ─────────────────────────────────────────────────────────────────────────────
-- P1: Enforce ticket-number uniqueness per lottery
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Problem:
--   ticket_number has no uniqueness constraint. Two different lotteries can and
--   do reuse the same ticket code for different people:
--     SVI2252 -> "Saipriya Bhatia" (Lucky Draw 20 Oct 2026)
--             -> "Sharda Bai"    (Lucky Draw 16 Oct 2026)
--     SVI2254 -> "SANJAY KUMAR YADAV" (Lucky Draw 20 Oct 2026)
--             -> "Seema Joshi"        (Lucky Draw 16 Oct 2026)
--   A ticket number is the customer-facing reference used in draw-result emails,
--   allotment letters and payment receipts, so it must identify exactly one
--   participant within a draw.
--
-- Fix:
--   Unique index on (lottery_id, ticket_number). Intra-lottery duplicates were
--   verified to be zero before creating it, so this is a no-op on current data.
--   Cross-lottery reuse stays legal (the same client may legitimately re-enter
--   a later draw), which is what the P0 fix for cross-lottery PII scoping
--   already accounts for.

-- Safety: normalise any pre-existing intra-lottery duplicates by suffixing the
-- later rows, so the index can be created without failing on real data.
DO $$
DECLARE
  dup RECORD;
  suffix INTEGER := 1;
  new_ticket TEXT;
BEGIN
  FOR dup IN
    SELECT id, lottery_id, ticket_number
    FROM public.lottery_participants
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY lottery_id, ticket_number
                 ORDER BY created_at ASC, id ASC
               ) AS rn
        FROM public.lottery_participants
      ) d
      WHERE d.rn > 1
    )
  LOOP
    suffix := suffix + 1;
    new_ticket := dup.ticket_number || '-D' || suffix;
    UPDATE public.lottery_participants
    SET ticket_number = new_ticket
    WHERE id = dup.id;
    RAISE NOTICE 'Renamed duplicate ticket % -> %', dup.ticket_number, new_ticket;
  END LOOP;
END $$;

-- Unique ticket number within a single draw
CREATE UNIQUE INDEX IF NOT EXISTS idx_lottery_participants_lottery_ticket_unique
  ON public.lottery_participants (lottery_id, ticket_number);

NOTIFY pgrst, 'reload schema';
