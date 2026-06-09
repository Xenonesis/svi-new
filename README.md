# SVI Infra Solutions — Next.js Web Application

**SVI Infra Solutions Pvt. Ltd.** is a premium real estate development platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This application serves as a full-featured corporate website and administrative portal for managing real estate projects, client relationships, employee attendance, document generation, and more.

The platform combines a modern, responsive public-facing website with a comprehensive admin dashboard, featuring Supabase-powered authentication and database services, AI integration via Groq (Llama 4) and Google Gemini, interactive mapping with MapLibre GL, real-time analytics, a robust PDF document generation system, an email marketing suite, and a lottery management system.

---

## Tech Stack

### Core Framework & Language

| Technology     | Version | Purpose                                       |
| -------------- | ------- | --------------------------------------------- |
| **Next.js**    | ^16.2.6 | React framework with App Router, SSR, and SSG |
| **React**      | ^19.0.1 | UI component library                          |
| **TypeScript** | ^5.9.3  | Type-safe JavaScript                          |

### Styling & UI

| Technology                 | Version  | Purpose                                          |
| -------------------------- | -------- | ------------------------------------------------ |
| **Tailwind CSS**           | ^4.1.14  | Utility-first CSS framework                      |
| **@tailwindcss/postcss**   | ^4.3.0   | Tailwind CSS PostCSS plugin for v4               |
| **Tailwind Merge**         | ^3.6.0   | Intelligent Tailwind class merging               |
| **clsx**                   | ^2.1.1   | Conditional className utility                    |
| **Motion (Framer Motion)** | ^12.39.0 | Declarative animations for React                 |
| **Lucide React**           | ^1.16.0  | Open-source icon set                             |
| **Recharts**               | ^3.8.1   | Composable charting library for admin dashboards |
| **Sonner**                 | ^2.0.7   | Lightweight toast notification library           |
| **canvas-confetti**        | ^1.9.4   | Confetti animation effects for celebrations      |

### Backend & Database

| Technology          | Version  | Purpose                                          |
| ------------------- | -------- | ------------------------------------------------ |
| **Supabase Client** | ^2.106.1 | PostgreSQL database + authentication + real-time |
| **Supabase SSR**    | ^0.10.3  | Server-side rendering auth utilities             |
| **@google/genai**   | ^2.4.0   | Google Gemini AI API client                      |

### AI & Chatbot

| Technology        | Version  | Purpose                                     |
| ----------------- | -------- | ------------------------------------------- |
| **ai (Vercel)**   | ^6.0.198 | AI SDK for streaming chat and generative UI |
| **@ai-sdk/groq**  | ^3.0.39  | Groq AI provider for Llama 4 models         |
| **@ai-sdk/react** | ^3.0.200 | React hooks for AI SDK                      |

### Document Generation & Email

| Technology          | Version | Purpose                                                   |
| ------------------- | ------- | --------------------------------------------------------- |
| **jsPDF**           | ^4.2.1  | Client-side PDF generation for booking forms and invoices |
| **html2canvas-pro** | ^2.0.2  | HTML-to-canvas conversion for PDF content                 |
| **exceljs**         | ^4.4.0  | Excel file parsing and generation                         |
| **Resend**          | ^6.12.3 | Transactional email delivery API                          |
