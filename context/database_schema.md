# Database Schema (Supabase / PostgreSQL)

The project uses Supabase for PostgreSQL, Authentication, Row Level Security (RLS), and Realtime features. There are currently 52 migrations.

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

## Lottery & Campaigns

| Table Name          | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `lottery_campaigns` | Configuration and state for active lotteries/giveaways |
| `participants`      | Users who have entered specific lotteries              |

## HR & Internal

| Table Name      | Purpose                                    |
| --------------- | ------------------------------------------ |
| `activity_logs` | Audit trail of actions performed by admins |
| `careers`       | Job openings posted on the careers page    |
| `employees`     | Internal employee directory                |
| `attendance`    | Employee attendance tracking               |
