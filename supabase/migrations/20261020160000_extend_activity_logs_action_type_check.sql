-- Extend activity_logs.action_type CHECK to every action type the application writes.
--
-- Problem: the live database still carries the 9-value constraint from
-- 20260520140000_activity_logs_check_constraint.sql. Every insert using a newer
-- action type (lottery_drawn, campaign_created, career_created, location_created,
-- deal_value_updated, property_deleted, email_template_*, ...) is rejected with
-- Postgres 23514, so those audit rows were silently lost.
--
-- The 20260531100000 / 20260531110000 migrations extended the constraint only
-- partially, and later feature migrations (20260826000000 employee workspace,
-- 20260923010000 hardening, careers/email-template/property routes) introduced
-- further action types without updating it.
--
-- Fix: drop and recreate the CHECK with the complete, current list.

ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_action_type_check;

ALTER TABLE public.activity_logs ADD CONSTRAINT activity_logs_action_type_check
  CHECK (action_type IN (
    -- core
    'user_created',
    'user_deleted',
    'document_generated',
    'document_downloaded',
    'settings_updated',
    'profile_updated',
    'team_created',
    'team_deleted',
    'attendance_marked',
    -- attendance workspace
    'location_created',
    -- lottery
    'lottery_drawn',
    'lottery_scheduled',
    'lottery_schedule_cancelled',
    -- email campaigns
    'campaign_created',
    'campaign_updated',
    'campaign_deleted',
    'campaign_sent',
    'campaign_scheduled',
    -- email templates
    'email_template_created',
    'email_template_updated',
    'email_template_deleted',
    -- careers
    'career_created',
    'career_updated',
    'career_deleted',
    -- properties
    'property_created',
    'property_updated',
    'property_deleted',
    -- allotments
    'deal_value_updated'
  ));
