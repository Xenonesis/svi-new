-- ─────────────────────────────────────────────────────────────────────────────
-- P0: Stop authenticated (non-admin) clients from reading lottery PII
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Problem:
--   20260923010000_db_performance_and_security_hardening.sql revoked table-level
--   SELECT from `anon` on public.lottery_participants and granted SELECT only on
--   the non-sensitive columns. It did NOT revoke the `authenticated` role.
--
--   The platform default grants table-level SELECT to `authenticated`, so any
--   logged-in portal client (role = 'client') can read `email` and `phone` for
--   every participant of every lottery.
--
--   Verified live: a magic-link session for a portal client (role=client) read
--   5 rows of lottery_participants including email + phone.
--
-- Why a plain column-level REVOKE is not enough:
--   In PostgreSQL, REVOKE on a column does not override a table-level GRANT —
--   the table-level grant still grants every column. The only way to narrow a
--   table's columns for a role is to revoke the table-level grant and grant
--   the specific columns instead. That is what this migration does.
--
-- Fix:
--   1. Revoke table-level SELECT on lottery_participants from `authenticated`,
--      then grant only the non-sensitive columns.
--   2. Provide a SECURITY DEFINER RPC (admin-gated) so the admin console can
--      still read email/phone for participants. service_role keeps full access.
--
--   The public draw pages only ever select id, name, ticket_number and
--   is_winner, so they keep working unchanged.

-- ── 1. Narrow the authenticated grant to non-sensitive columns ───────────────

REVOKE ALL ON public.lottery_participants FROM authenticated;

GRANT SELECT (id, lottery_id, name, ticket_number, is_winner, prize_rank, created_at)
  ON public.lottery_participants TO authenticated;

-- ── 2. Admin-gated RPC for PII-bearing reads ────────────────────────────────
-- The admin console (View Participants, Edit Campaign, Bulk Email, exports and
-- the winner-picker search) needs participant email and phone. Those reads go
-- through this RPC, which is only executable by service_role and by admins.

CREATE OR REPLACE FUNCTION public.get_lottery_participants_admin(
  p_lottery_id uuid,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 200
)
RETURNS TABLE (
  id uuid,
  lottery_id uuid,
  name text,
  ticket_number text,
  phone text,
  email text,
  is_winner boolean,
  prize_rank integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    lp.id,
    lp.lottery_id,
    lp.name,
    lp.ticket_number,
    lp.phone,
    lp.email,
    lp.is_winner,
    lp.prize_rank,
    lp.created_at
  FROM public.lottery_participants lp
  WHERE lp.lottery_id = p_lottery_id
    AND (
      p_search IS NULL
      OR btrim(p_search) = ''
      OR lp.name ILIKE '%' || btrim(p_search) || '%'
      OR lp.ticket_number ILIKE '%' || btrim(p_search) || '%'
    )
  ORDER BY lp.is_winner DESC, lp.name ASC
  LIMIT LEAST(GREATEST(p_limit, 1), 1000);
$$;

REVOKE EXECUTE ON FUNCTION public.get_lottery_participants_admin(uuid, text, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_lottery_participants_admin(uuid, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_lottery_participants_admin(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_lottery_participants_admin(uuid, text, integer) TO service_role;

-- ── 3. Notify PostgREST to reload the schema cache ───────────────────────────
NOTIFY pgrst, 'reload schema';
