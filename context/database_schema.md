# Database Schema (Supabase / PostgreSQL)

The project uses Supabase for PostgreSQL, Authentication, Row Level Security (RLS), and Realtime features. There are currently 64 migrations.

## Core Tables

| Table Name        | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `profiles`        | Extended user data for accounts, including admin roles |
| `portal_settings` | Global key-value store for application configuration   |
| `properties`      | Main property listings and details                     |
| `project_images`  | Image galleries tied to properties/projects            |
| `registrations`   | Customer registrations and leads                       |
| `site_visits`     | Scheduling for property tours                          |

## Security & System

| Table Name    | Purpose                                                |
| ------------- | ------------------------------------------------------ |
| `rate_limits` | Distributed sliding window rate limiting for endpoints |

## Records & Documents

| Table Name             | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `documents`            | Metadata for generated PDF documents            |
| `allotment_records`    | Tracking records for property allotment letters |
| `bba_records`          | Tracking records for Builder-Buyer Agreements   |
| `offer_letter_records` | Tracking records for offer letters              |

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

| Table Name                   | Purpose                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `activity_logs`              | Audit trail of actions performed by admins                         |
| `careers`                    | Job openings posted on the careers page                            |
| `teams`                      | Employee departments and teams                                     |
| `team_members`               | Mapping of users to teams                                          |
| `attendance_records`         | Employee punch-in / punch-out records and geofence verification    |
| `attendance_settings`        | Shift timings, cutoffs, and geofence radius settings               |
| `geofence_locations`         | Admin-configured authorized office/site geofence coordinates       |
| `attendance_sessions`        | Dynamic daily attendance sessions                                  |
| `employee_tasks`             | Task tracking, to-dos, priorities, categories, and due dates       |
| `employee_work_logs`         | Daily work summaries, completed tasks, and client interaction logs |
| `employee_leaves`            | Leave applications, balance tracking, and approval workflow        |
| `attendance_regularizations` | Missed punch regularization requests and admin approval workflow   |
