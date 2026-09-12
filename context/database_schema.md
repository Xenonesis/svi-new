# Database Schema (Supabase / PostgreSQL)

The project uses Supabase for PostgreSQL, Authentication, Row Level Security (RLS), and Realtime features. There are currently 66 migrations, including non-destructive composite performance indexes on high-traffic tables (`chat_leads`, `attendance_records`, `documents`, `notifications`, and `profiles`).

## Core Tables

| Table Name        | Purpose                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `profiles`        | Extended user data for accounts, including admin/employee roles, phone, department, real_email, notes, and is_active status |
| `portal_settings` | Global key-value store for application configuration                                                                        |
| `properties`      | Main property listings and details                                                                                          |
| `project_images`  | Image galleries tied to properties/projects                                                                                 |
| `registrations`   | Customer registrations and leads                                                                                            |
| `site_visits`     | Scheduling for property tours                                                                                               |

## Security & System

| Table Name    | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `rate_limits` | Distributed sliding window rate limiting for endpoints |

## Records & Documents

| Table Name             | Purpose                                                                                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `documents`            | Metadata and form payloads for generated PDF/PNG documents (`quotation`, `allotment_letter`, `payment_receipt`, `payment_plan`, `offer_letter`, `bba`). Features partial unique index `idx_documents_quotation_number` on `((form_data->>'quotationNo'))` and atomic sequence generator `get_next_quotation_number` |
| `allotment_records`    | Tracking records for property allotment letters                                                                                                                                                                                                                                                                     |
| `bba_records`          | Tracking records for Builder-Buyer Agreements                                                                                                                                                                                                                                                                       |
| `offer_letter_records` | Tracking records for offer letters                                                                                                                                                                                                                                                                                  |

## Email & Communication

| Table Name           | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `email_drafts`       | Saved email drafts in the admin email center |
| `scheduled_emails`   | Queue for emails to be sent in the future    |
| `campaigns`          | Email marketing campaigns                    |
| `contact_groups`     | Segments/groupings for mass emailing         |
| `push_subscriptions` | PWA push notification subscriptions          |
| `notifications`      | In-app notifications for admins and users    |
| `chat_leads`         | Captured leads from the AI Chatbot           |

## WhatsApp sales agent MVP

The WhatsApp channel uses server-only, RLS-protected tables. Browser roles have no direct grants.

| Table                          | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `whatsapp_contacts`            | Normalized E.164 contacts, consent, and opt-out state              |
| `whatsapp_conversations`       | Durable AI, Human, or Paused conversation state and service window |
| `whatsapp_messages`            | Individual inbound/outbound messages and provider delivery status  |
| `whatsapp_processing_jobs`     | Recoverable, bounded background work                               |
| `whatsapp_templates`           | Admin-controlled Meta approval metadata                            |
| `whatsapp_follow_ups`          | At most two deduplicated template follow-ups per conversation      |
| `whatsapp_site_visit_requests` | Requests awaiting salesperson confirmation                         |
| `whatsapp_company_settings`    | Allowlisted company facts that require admin verification          |

`chat_leads` remains the compatible lead table and now also holds normalized phone, lifecycle, qualification, assignment, consent, temperature, and summary fields.

## Lottery & Campaigns

| Table Name          | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `lottery_campaigns` | Configuration and state for active lotteries/giveaways |
| `participants`      | Users who have entered specific lotteries              |

## HR, Attendance & Employee Workspace

| Table Name                   | Purpose                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `activity_logs`              | Audit trail of actions performed by admins                                                            |
| `careers`                    | Job openings posted on the careers page                                                               |
| `teams`                      | Employee departments and teams                                                                        |
| `team_members`               | Mapping of users to teams                                                                             |
| `attendance_records`         | Employee punch-in / punch-out records and geofence verification                                       |
| `attendance_settings`        | Shift timings, cutoffs, and geofence radius settings                                                  |
| `geofence_locations`         | Admin-configured authorized office/site geofence coordinates                                          |
| `attendance_sessions`        | Dynamic daily attendance sessions                                                                     |
| `employee_tasks`             | Task tracking, to-dos, priorities, categories, and due dates                                          |
| `employee_work_logs`         | Daily work summaries, completed tasks, and client interaction logs                                    |
| `employee_leaves`            | Leave applications, balance tracking, and approval workflow                                           |
| `attendance_regularizations` | Missed punch regularization requests and admin approval workflow                                      |
| `lead_activities`            | Chronological audit trail of employee lead notes, status updates, calls, and follow-up reminders      |
| `employee_salary_structures` | Base salary packages, Basic/HRA/Allowances, statutory deductions (PT, TDS, PF, ESI), and bank details |
| `monthly_payrolls`           | Monthly payroll run batches, total expenses, approval status, and master payslip release toggle       |
| `payroll_items`              | Per-employee itemized monthly payslip, attendance LOP deductions, incentives, and download permission |

## Performance & Search Indexes

To maintain sub-50ms query execution across growing datasets without destructive schema changes:

| Index Name                                      | Table & Columns                                         | Purpose                                                  |
| ----------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| `idx_chat_leads_assigned_created`               | `chat_leads(assigned_to, created_at DESC)`              | Fast employee lead pipeline queries                      |
| `idx_chat_leads_source_created`                 | `chat_leads(source, created_at DESC)`                   | Fast lead source filtering                               |
| `idx_chat_leads_temp_created`                   | `chat_leads(temperature, created_at DESC)`              | Hot / Warm / Cold triage speedup                         |
| `idx_chat_leads_name_trgm`                      | `chat_leads USING gin (name gin_trgm_ops)`              | Instant substring search on lead name                    |
| `idx_chat_leads_phone_trgm`                     | `chat_leads USING gin (phone gin_trgm_ops)`             | Instant substring search on lead phone                   |
| `idx_chat_leads_email_trgm`                     | `chat_leads USING gin (email gin_trgm_ops)`             | Instant substring search on lead email                   |
| `idx_profiles_name_trgm`                        | `profiles USING gin (full_name gin_trgm_ops)`           | Instant employee directory substring search              |
| `idx_profiles_phone_trgm`                       | `profiles USING gin (phone gin_trgm_ops)`               | Instant employee phone search                            |
| `idx_notifications_unread_created`              | `notifications(created_at DESC) WHERE is_read = false`  | Instant unread admin notification count (<5% table size) |
| `idx_attendance_user_date`                      | `attendance_records(user_id, date DESC)`                | Instant user attendance history                          |
| `idx_lead_activities_lead_created`              | `lead_activities(lead_id, created_at DESC)`             | Instant lead activity timeline & batch lookups           |
| `idx_registrations_status_created`              | `registrations(status, created_at DESC)`                | Fast customer status filtering                           |
| `idx_registrations_project_created`             | `registrations(project, created_at DESC)`               | Fast customer project breakdown                          |
| `idx_registrations_name_trgm`                   | `registrations USING gin (name gin_trgm_ops)`           | Instant customer name search                             |
| `idx_registrations_phone_trgm`                  | `registrations USING gin (phone gin_trgm_ops)`          | Instant customer phone search                            |
| `idx_registrations_subid_trgm`                  | `registrations USING gin (submission_id gin_trgm_ops)`  | Instant customer submission ID lookup                    |
| `idx_whatsapp_messages_conv_created`            | `whatsapp_messages(conversation_id, created_at ASC)`    | Instant WhatsApp chat message history loading            |
| `idx_whatsapp_followups_conv_seq`               | `whatsapp_follow_ups(conversation_id, sequence_number)` | Fast WhatsApp scheduled follow-up lookup                 |
| `idx_chat_leads_assigned_status`                | `chat_leads(assigned_to, lifecycle_status)`             | Index-Only Scan for employee conversion stats            |
| `idx_activity_logs_created`                     | `activity_logs(created_at DESC)`                        | Fast audit trail ordering                                |
| `idx_activity_logs_action`                      | `activity_logs(action_type, created_at DESC)`           | Filtered audit actions                                   |
| `idx_activity_logs_desc_trgm`                   | `activity_logs USING gin (description gin_trgm_ops)`    | Instant audit log text search                            |
| `idx_employee_tasks_user_status`                | `employee_tasks(user_id, status)`                       | Fast employee task status filtering                      |
| `idx_employee_tasks_user_created`               | `employee_tasks(user_id, created_at DESC)`              | Chronological employee task list                         |
| `idx_employee_work_logs_user_date`              | `employee_work_logs(user_id, date DESC)`                | Instant user daily work summary lookup                   |
| `idx_site_visits_assigned_status`               | `whatsapp_site_visit_requests(assigned_to, status)`     | Fast assigned active site visits lookup                  |
| `idx_profiles_created`                          | `profiles(created_at DESC)`                             | Instant user-growth & registration timeline queries      |
| `idx_employee_leaves_status_created`            | `employee_leaves(status, created_at DESC)`              | Instant pending leaves lookup for Approvals tab          |
| `idx_employee_leaves_user_status`               | `employee_leaves(user_id, status)`                      | Fast user approved leave balances                        |
| `idx_attendance_regularizations_status_created` | `attendance_regularizations(status, created_at DESC)`   | Instant pending regularization requests                  |
| `idx_attendance_regularizations_user_status`    | `attendance_regularizations(user_id, status)`           | Fast user regularizations check                          |
| `idx_profiles_email_trgm`                       | `profiles USING gin (email gin_trgm_ops)`               | Instant user directory substring email search            |
| `idx_registrations_created_status`              | `registrations(created_at DESC, status)`                | Fast 30-day registration analytics donut/trend charts    |
| `idx_lottery_participants_lottery_created`      | `lottery_participants(lottery_id, created_at DESC)`     | Fast lottery participant drawing & history               |
