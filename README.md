# SVI Infra Solutions — Next.js Web Application

**SVI Infra Solutions Pvt. Ltd.** is a premium real estate development platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. This application serves as a full-featured corporate website and administrative portal for managing real estate projects, client relationships, employee attendance, document generation, and more.

The platform combines a modern, responsive public-facing website with a comprehensive admin dashboard, featuring Supabase-powered authentication and database services, AI integration via Google Gemini API, interactive mapping with Google Maps, real-time analytics, and a robust PDF document generation system.

---

## Tech Stack

### Core Framework & Language

| Technology     | Version | Purpose                                       |
| -------------- | ------- | --------------------------------------------- |
| **Next.js**    | ^16.2.6 | React framework with App Router, SSR, and SSG |
| **React**      | ^19.0.1 | UI component library                          |
| **TypeScript** | ~5.8.2  | Type-safe JavaScript                          |

### Styling & UI

| Technology                 | Version  | Purpose                                          |
| -------------------------- | -------- | ------------------------------------------------ |
| **Tailwind CSS**           | ^4.1.14  | Utility-first CSS framework                      |
| **Motion (Framer Motion)** | ^12.39.0 | Declarative animations for React                 |
| **Lucide React**           | ^1.16.0  | Open-source icon set                             |
| **Recharts**               | ^3.8.1   | Composable charting library for admin dashboards |

### Backend & Database

| Technology          | Version  | Purpose                                       |
| ------------------- | -------- | --------------------------------------------- |
| **Supabase Client** | ^2.106.1 | PostgreSQL database + real-time subscriptions |
| **Supabase SSR**    | ^0.10.3  | Server-side rendering auth utilities          |
| **@google/genai**   | ^2.4.0   | Google Gemini AI API client                   |

### Document Generation & Email

| Technology          | Version | Purpose                                                   |
| ------------------- | ------- | --------------------------------------------------------- |
| **jsPDF**           | ^4.2.1  | Client-side PDF generation for booking forms and invoices |
| **html2canvas-pro** | ^2.0.2  | HTML-to-canvas conversion for PDF content                 |
| **Resend**          | ^6.12.3 | Transactional email delivery API                          |

### Maps & Analytics

| Technology                    | Version | Purpose                                      |
| ----------------------------- | ------- | -------------------------------------------- |
| **@vis.gl/react-google-maps** | ^1.8.3  | React wrapper for Google Maps JavaScript API |
| **@vercel/analytics**         | ^2.0.1  | Vercel web analytics                         |
| **@vercel/speed-insights**    | ^2.0.0  | Real User Monitoring for Core Web Vitals     |

### Development & Tooling

| Technology      | Version | Purpose                                                    |
| --------------- | ------- | ---------------------------------------------------------- |
| **ESLint**      | ^9.39.4 | Static code analysis with TypeScript/React/Next.js plugins |
| **Prettier**    | ^3.8.3  | Code formatter with Tailwind CSS class sorting             |
| **Husky**       | ^9.1.7  | Git hooks for pre-commit and commit-msg validation         |
| **lint-staged** | ^17.0.5 | Runs linters only on staged git files                      |
| **Commitlint**  | ^21.0.1 | Conventional commits validation                            |
| **Vitest**      | ^4.1.7  | Unit/integration test runner with jsdom environment        |
| **tsx**         | ^4.22.3 | TypeScript execution for Node.js scripts                   |

---

## Architecture Overview

The application follows a **hybrid rendering architecture** leveraging Next.js App Router:

- **Server Components** are the default — data fetching and rendering happen on the server
- **Client Components** are explicitly marked with `"use client"` for interactive features (maps, animations, admin interaction)
- **API Routes** (`app/api/`) provide serverless endpoint handlers for auth, form submissions, and database operations
- **Static Generation** is used for marketing pages (About, Privacy Policy, Terms) for optimal performance
- **Dynamic Rendering** is used for admin pages and project listings requiring up-to-date data

### Key Architectural Decisions

1. **Supabase as Backend-as-a-Service**: Authentication, database, real-time subscriptions, and file storage are handled by Supabase, eliminating the need for a custom backend server
2. **SSR Authentication with @supabase/ssr**: Cookie-based session management compatible with Next.js App Router's server components
3. **Component Separation**: Clean split between `src/components/common/` (reusable UI primitives) and admin-specific components
4. **Modular Data Layer**: `src/data/` contains domain-specific data definitions; `src/lib/` houses utilities and Supabase client configuration
5. **Client-Side PDF Generation**: Booking forms and invoices generated using jsPDF and html2canvas-pro to avoid server CPU overhead

---

## Features

### Public-Facing Features

- **Landing Page & Navigation**: Hero section with animations, responsive sticky header with transparent-to-solid scroll transition, mobile hamburger menu, theme toggle (light/dark)
- **Project Showcase**: Current projects with progress status; completed projects with Google Maps integration showing project locations
- **Company Pages**: About Us, Leadership (team profiles), Careers (job listings), Blog (market insights and news)
- **Client Engagement**: Contact form (Resend email API), Registration (Supabase auth), Client Login, Payment portal, FAQ (accordion UI), Grievance submission, Thank You confirmation
- **Legal**: Privacy Policy, Terms & Conditions, GDPR-compliant Cookie Consent banner
- **UI/UX**: Scroll-triggered Motion animations, breadcrumbs, back-to-top button, WhatsApp chat button, hover zoom on images, animated stats counters, error boundary fallback

### Admin Portal Features

- **Dashboard**: KPIs, Recharts-powered analytics charts, quick action cards, activity timeline feed
- **User Management**: Admin session provider with persistent auth, user CRUD and role management
- **Attendance System**: Daily check-in/check-out, monthly reports with database migration support
- **Document Generation**: Dynamic PDFs for booking forms, invoices, and custom reports
- **Notifications**: Real-time notification dropdown in admin header, create/read/dismiss workflow
- **Settings**: Configurable application parameters in database
- **Data Management**: Form submission management, project CRUD, blog article publishing

---

## Project Structure

```
svi-infra/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Public website route group
│   │   ├── about/                #    /about
│   │   ├── blog/                 #    /blog
│   │   ├── careers/              #    /careers
│   │   ├── contact/              #    /contact
│   │   ├── faq/                  #    /faq
│   │   ├── grievance/            #    /grievance
│   │   ├── leadership/           #    /leadership
│   │   ├── login/                #    /login
│   │   ├── payment/              #    /payment
│   │   ├── privacy-policy/       #    /privacy-policy
│   │   ├── projects/completed/   #    Completed projects + Google Maps
│   │   ├── projects/current/     #    Ongoing projects
│   │   ├── registration/         #    /registration
│   │   ├── terms-conditions/     #    /terms
│   │   └── thank-you/            #    /thank-you
│   ├── admin/                    # Admin portal (authenticated)
│   │   ├── attendance/           #    Employee check-in/out
│   │   ├── dashboard/            #    Analytics & KPIs
│   │   ├── documents/            #    PDF generation
│   │   ├── notifications/        #    Notification center
│   │   ├── reports/              #    Custom reports
│   │   ├── settings/             #    System configuration
│   │   ├── submissions/          #    Form submissions
│   │   └── users/                #    User administration
│   ├── api/                      # API route handlers
│   │   ├── auth/                 #    Authentication endpoints
│   │   ├── contact/              #    Contact form submission
│   │   ├── grievance/            #    Grievance submission
│   │   ├── notifications/        #    Notification CRUD
│   │   ├── registration/         #    User registration
│   │   └── seed/                 #    Database seeding
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── opengraph-image.tsx       # Dynamic OG image generation
│   ├── page.tsx                  # Home page
│   ├── robots.ts                 # Dynamic robots.txt
│   └── sitemap.ts                # Dynamic XML sitemap
├── public/                       # Static assets
│   ├── favicons/                 # Favicon variants
│   ├── images/                   # Image assets
│   ├── logo.png
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt
│   └── theme-init.js             # Theme init script (prevents flash)
├── src/                          # Source code
│   ├── components/
│   │   ├── admin/                # Admin portal components
│   │   │   ├── ActivityTimeline.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminSessionProvider.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── attendance/       #    Attendance tracking UI
│   │   │   ├── ChartComponents/  #    Recharts wrappers
│   │   │   ├── DocumentGenerator/#    PDF generation UI
│   │   │   ├── NotificationDropdown.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── common/               # Reusable components
│   │   │   ├── Analytics.tsx
│   │   │   ├── AnimatedSection.tsx
│   │   │   ├── BackToTop.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── CookieConsent.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── HoverZoomImage.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── social-icons.tsx
│   │   │   ├── StatsCounter.tsx
│   │   │   └── WhatsAppChat.tsx
│   │   ├── ClientProviders.tsx    # Provider composition
│   │   ├── CompletedProjectsMap.tsx # Google Maps component
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ThemeProvider.tsx
│   ├── data/                     # Static data
│   │   ├── features.ts
│   │   ├── navigation.ts
│   │   ├── projects.ts
│   │   └── team.ts
│   ├── lib/                      # Utilities
│   │   ├── actions/              #    Server actions
│   │   ├── supabase/             #    Supabase client config
│   │   ├── utils.ts
│   │   └── validations.ts
│   └── index.css
├── supabase/                     # Database migrations
│   ├── migration.sql
│   ├── attendance-migration.sql
│   ├── forms-migration.sql
│   ├── notifications-setup.sql
│   └── performance-indexes.sql
├── scripts/                      # Automation scripts
├── __tests__/                    # Test suites
├── types/                        # TypeScript definitions
├── .env.example
├── .editorconfig
├── .eslintrc / eslint.config.js
├── .prettierrc
├── commitlint.config.cjs
├── next.config.ts
├── postcss.config.js
├── tsconfig.json
├── vercel.json
├── vitest.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** — Latest LTS (v20 or v22 recommended)
- **npm** — Ships with Node.js
- **Supabase** — Free account for database and authentication
- **Google Cloud Platform** — Account for Maps and Gemini AI APIs
- **Vercel** — Free account for deployment (optional for local dev)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Xenonesis/svi-new.git
   cd svi-new
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your keys (see Environment Variables section below).

4. **Initialize the database:**

   Create a Supabase project and run migrations from `supabase/` directory in order: `migration.sql` (core schema), `forms-migration.sql`, `attendance-migration.sql`, `notifications-setup.sql`, `performance-indexes.sql`.

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
# Application
APP_URL="http://localhost:3000"

# Supabase (from project dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"   # Secret — server-side only

# Google APIs
GEMINI_API_KEY="your_gemini_api_key"                          # https://aistudio.google.com/apikey
NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY="your_google_maps_key"   # https://console.cloud.google.com

# Email
RESEND_API_KEY="your_resend_api_key"                          # https://resend.com

# Optional
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"                       # Google Analytics
```

---

## Available Scripts

| Script           | Command                                  | Description                           |
| ---------------- | ---------------------------------------- | ------------------------------------- |
| `dev`            | `next dev --port 3000`                   | Development server with HMR           |
| `build`          | `next build`                             | Production build                      |
| `start`          | `next start`                             | Start production server               |
| `test`           | `vitest run`                             | Run all tests                         |
| `test:watch`     | `vitest`                                 | Watch mode                            |
| `lint`           | `eslint . --ext .ts,.tsx,.js,.jsx`       | Code quality check                    |
| `lint:fix`       | `eslint . --ext .ts,.tsx,.js,.jsx --fix` | Auto-fix lint issues                  |
| `format`         | `prettier --write .`                     | Format all files                      |
| `format:check`   | `prettier --check .`                     | Verify formatting                     |
| `prepare`        | `husky`                                  | Init git hooks (auto-runs on install) |
| `clean`          | `rm -rf .next`                           | Remove build artifacts                |
| `generate-icons` | `node scripts/generate-icons.js`         | Generate favicon variants             |

---

## Routing & Pages

### Public Routes

| Route                 | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `/`                   | Landing page with hero, featured projects, company overview |
| `/about`              | Company history, mission, vision, values                    |
| `/blog`               | Market insights and company news                            |
| `/careers`            | Job openings and career applications                        |
| `/contact`            | Inquiry form → Resend email API                             |
| `/faq`                | FAQs with accordion UI                                      |
| `/grievance`          | Complaint submission with tracking                          |
| `/leadership`         | Management team profiles                                    |
| `/login`              | Client authentication portal                                |
| `/payment`            | Online payment portal                                       |
| `/privacy-policy`     | Data protection documentation                               |
| `/projects/completed` | Delivered projects with Google Maps                         |
| `/projects/current`   | Ongoing developments                                        |
| `/registration`       | New user registration (Supabase auth)                       |
| `/terms-conditions`   | Terms of service                                            |
| `/thank-you`          | Post-submission confirmation                                |

### Admin Routes

All admin routes are behind authentication via `AdminSessionProvider`:

`/admin/dashboard` (analytics + KPIs), `/admin/attendance` (check-in/out), `/admin/documents` (PDF generation), `/admin/notifications`, `/admin/reports`, `/admin/settings` (configuration), `/admin/submissions` (form management), `/admin/users` (user administration).

### API Routes

`/api/auth/*` (authentication), `/api/contact` (POST — contact form), `/api/grievance` (POST — grievance), `/api/notifications/*` (CRUD), `/api/registration` (POST), `/api/seed` (POST — test data).

---

## Component Architecture

### Provider Hierarchy (in `ClientProviders.tsx`)

```
ThemeProvider          — Light/dark mode context (localStorage + OS preference)
  └─ SessionProvider   — Supabase auth session (client-side)
       └─ Children     — Page content
```

### Common Components (`src/components/common/`)

| Component         | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `AnimatedSection` | Scroll-triggered fade/slide animations via Motion's `useInView` |
| `BackToTop`       | Floating scroll-to-top button                                   |
| `Breadcrumbs`     | Auto-generated breadcrumb trail from URL path                   |
| `CookieConsent`   | GDPR-compliant consent banner with localStorage                 |
| `ErrorBoundary`   | React error boundary with fallback UI                           |
| `HoverZoomImage`  | Image with CSS transform zoom on hover                          |
| `ScrollToTop`     | Auto-scroll to top on route change                              |
| `StatsCounter`    | Animated counter that counts up on scroll into view             |
| `WhatsAppChat`    | Floating WhatsApp chat button                                   |
| `Analytics`       | Vercel Analytics and Speed Insights integration                 |
| `social-icons`    | Social media icon set                                           |

### Admin Components (`src/components/admin/`)

`AdminHeader` (top nav + notifications), `AdminSidebar` (collapsible nav), `AdminSessionProvider` (auth context), `ActivityTimeline` (chronological activity feed), `NotificationDropdown` (read/unread panel), `QuickActions` (dashboard shortcuts), `attendance/` (check-in UI), `ChartComponents/` (Recharts wrappers), `DocumentGenerator/` (PDF preview and download).

---

## Data Layer

### Supabase Integration

- **Authentication**: Email/password with `@supabase/ssr` — cookie-based sessions compatible with App Router server components
- **PostgreSQL Database**: Schema defined through migration files — core tables, attendance tracking, form submissions, notifications, and performance indexes
- **Client Architecture**: Server-side `createServerClient()` for cookie-based auth; client-side `createBrowserClient()` for real-time subscriptions; service role client for privileged admin operations

### Data Modules (`src/data/`)

- `features.ts` — Service offerings for homepage and about page
- `navigation.ts` — Navigation structures and route metadata for Header
- `projects.ts` — Project data (names, descriptions, locations, map coordinates, status)
- `team.ts` — Team member profiles (names, roles, bios, headshots)

---

## State Management & Providers

### ThemeProvider

- Provides `ThemeContext` with `theme` (light/dark) and `setTheme`
- Persists to `localStorage` under key `svi-theme`
- Falls back to OS `prefers-color-scheme`
- Initializes via `public/theme-init.js` to prevent flash of wrong theme on page load

### ClientProviders

Composes ThemeProvider + Supabase session provider + Vercel Analytics into a single wrapper used in `app/layout.tsx`.

---

## Animations & UI Effects

The project uses the **Motion** library for declarative animations:

| Element          | Animation                                                |
| ---------------- | -------------------------------------------------------- |
| Hero section     | Fade-in with scale entrance on load                      |
| Scroll reveal    | Elements fade upward via `AnimatedSection` + `useInView` |
| Stats counter    | Values count up with spring physics                      |
| Navigation hover | Gold underline slides in from left                       |
| Header scroll    | Transparent → solid with backdrop blur                   |
| Theme toggle     | Smooth light/dark transition                             |
| FAQ accordion    | Smooth height and opacity on expand/collapse             |
| Project cards    | Lift effect with shadow on hover                         |

---

## Testing Strategy

The project uses **Vitest** with **jsdom** for DOM simulation.

- **API Tests**: `__tests__/api/` — end-to-end tests for route handlers
- **Component Tests**: Unit tests for React components (Vitest + @testing-library/react compatible)
- **Integration Tests**: Component interaction and data flow tests

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

Vitest config includes React plugin for JSX, jsdom environment, and `@/` path alias resolution.

---

## Development Workflow

### Code Quality Gates

The pipeline enforces quality through **Husky git hooks**:

- **pre-commit**: `lint-staged` runs ESLint + Prettier on staged files
- **commit-msg**: Validates conventional commits format

### Commit Convention

All commits must follow **Conventional Commits**: `<type>(<scope>): <description>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**: `feat(admin): add attendance check-in/out UI`, `fix(header): resolve mobile menu overflow on iOS`

### Lint-Staged Configuration

| File Pattern                        | Checks                       |
| ----------------------------------- | ---------------------------- |
| `*.ts`, `*.tsx`, `*.js`, `*.jsx`    | ESLint fix + Prettier format |
| `*.json`, `*.md`, `*.yml`, `*.yaml` | Prettier format              |

### ESLint Configuration

The flat config (`eslint.config.js`) includes TypeScript ESLint (type-aware), React plugin, React Hooks plugin (Rules of Hooks), Next.js plugin (Image, routing conventions), and Prettier integration.

### Prettier Configuration

Semicolons enabled, single quotes, ES5 trailing commas, 2-space tabs, Tailwind CSS class sorting via `prettier-plugin-tailwindcss`.

---

## Deployment

### Vercel Deployment

1. Push code to GitHub/GitLab/Bitbucket
2. Import repo into Vercel
3. Set environment variables in Project Settings → Environment Variables
4. Deploy — Vercel auto-builds on each push to the production branch

**`vercel.json`:**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Alternative Platforms

AWS (Amplify or ECS/Fargate), Google Cloud Run (with Dockerfile), Azure Static Web Apps, or any dedicated server running `npm run start`.

---

## Third-Party Integrations

- **Google Gemini AI** (`@google/genai`): AI-powered content generation and suggestions — server-side only for credential security
- **Google Maps** (`@vis.gl/react-google-maps`): Interactive project location maps — restrict API key by HTTP referrer
- **Resend**: Transactional email for contact forms, grievance acknowledgment, registration confirmation
- **Vercel Analytics**: Privacy-friendly page view and visitor tracking
- **Vercel Speed Insights**: Real-user Core Web Vitals measurement (LCP, FID/INP, CLS)
- **Supabase Realtime**: WebSocket-based live updates for notifications and activity feeds

---

## Performance & SEO

### Performance

- Server Components by default minimize client-side JavaScript
- Next.js `<Image>` with automatic WebP/AVIF, lazy loading, and responsive sizing
- Route segment caching for instant page loads
- Code splitting at the route level
- Motion library tree-shakes unused animation features
- Strategic PostgreSQL indexes from `performance-indexes.sql`

### SEO

- Dynamic metadata (`generateMetadata()`) per page
- Dynamic Open Graph image generation (`opengraph-image.tsx`)
- XML sitemap (`app/sitemap.ts`) covering all public routes
- Robots.txt (static + dynamic)
- Semantic HTML with proper heading hierarchy and ARIA attributes
- WCAG AA color contrast and visible focus states
- JSON-LD structured data for rich search results

---

## Troubleshooting

| Issue                      | Solution                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Dev server won't start     | Check Node.js v18+, delete `node_modules` and reinstall, run `npm run clean`        |
| Supabase connection errors | Verify `.env.local` keys, ensure Supabase project is active, check IP restrictions  |
| Auth not working           | Run all migrations, enable email/password auth in Supabase, configure site URL      |
| Google Maps not rendering  | Verify API key, enable Maps API in GCP console, check HTTP referrer restrictions    |
| Emails not sending         | Verify Resend API key, check delivery dashboard, verify sender domain               |
| Build failures             | Run `npm run clean`, check TypeScript (`npx tsc --noEmit`), ensure env vars are set |

---

## Contributing

1. Fork the repo and branch from `main`: `git checkout -b feat/your-feature-name`
2. Make changes following code quality standards
3. Run tests: `npm test && npm run lint && npm run format:check`
4. Commit using conventional commits: `git commit -m "feat(scope): description"`
5. Push and open a Pull Request

### Code Style Guidelines

- Use TypeScript strict mode with explicit types
- Prefer server components unless interactivity requires client components
- Use `@/` path alias for imports (e.g., `@/components/common/Button`)
- Place reusable components in `src/components/common/`, feature components co-located with routes
- Follow Prettier's auto-sorted Tailwind class order
- Write tests for new features; update tests when modifying logic

---

## License

**Private** — All rights reserved by SVI Infra Solutions Pvt. Ltd.

Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without prior written permission.

---

_© 2026 SVI Infra Solutions Pvt. Ltd. All rights reserved._
