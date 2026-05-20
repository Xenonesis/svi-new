-- Fix: extend activity_logs CHECK constraint for attendance action types
-- The original constraint only allows 6 values but attendance routes insert 3 more

alter table public.activity_logs drop constraint if exists activity_logs_action_type_check;
alter table public.activity_logs add constraint activity_logs_action_type_check
  check (action_type in (
    'user_created', 'user_deleted', 'document_generated', 'document_downloaded',
    'settings_updated', 'profile_updated', 'team_created', 'team_deleted',
    'attendance_marked'
  ));
