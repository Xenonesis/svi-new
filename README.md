# SVI - Next.js Web Application 1

A modern web application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Frontend:** React 19.0.1
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4.1.14
- **Animations:** Motion 12.23.24
- **Icons:** Lucide React
- **Maps:** @vis.gl/react-google-maps
- **AI Integration:** Google Gemini API (@google/genai)
- **Analytics:** Vercel Analytics & Speed Insights

## Features

- Server-side rendering with Next.js App Router
- Responsive design with Tailwind CSS
- Smooth animations with Motion
- Google Maps integration
- AI-powered features via Gemini API
- Performance monitoring with Vercel Speed Insights
- SEO optimization with dynamic metadata

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd svi-new
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update the following variables in `.env.local`:
     - `GEMINI_API_KEY`: Your Google Gemini API key (required for AI features)
     - `APP_URL`: Your application URL
     - `NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY`: Google Maps API key (required for map features)
     - `NEXT_PUBLIC_ANALYTICS_ID`: Google Analytics tracking ID (optional)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev` - Start the development server on port 3000
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run clean` - Remove the `.next` build directory

## Project Structure

```
svi-new/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── blog/              # Blog page
│   ├── careers/           # Careers page
│   ├── contact/           # Contact page
│   ├── faq/               # FAQ page
│   ├── grievance/         # Grievance page
│   ├── leadership/        # Leadership page
│   ├── login/             # Login page
│   ├── payment/           # Payment page
│   ├── privacy-policy/    # Privacy Policy page
│   ├── projects/          # Projects pages
│   │   ├── completed/     # Completed projects
│   │   └── current/       # Current projects
│   ├── registration/      # Registration page
│   ├── terms-conditions/  # Terms & Conditions page
│   ├── thank-you/         # Thank You page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── robots.ts          # Robots.txt generation
│   └── sitemap.ts         # Sitemap generation
├── public/                # Static assets
│   ├── images/            # Image assets
│   ├── logo.png           # Logo
│   ├── robots.txt         # Static robots.txt
│   └── sitemap.xml        # Static sitemap
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Reusable components
│   │   ├── ClientProviders.tsx
│   │   ├── CompletedProjectsMap.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ThemeProvider.tsx
│   └── index.css          # Additional styles
├── .env.example           # Environment variables template
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vercel.json            # Vercel deployment config
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required for Gemini AI API calls (server-side only)
GEMINI_API_KEY="your_gemini_api_key"

# Application URL
APP_URL="http://localhost:3000"

# Required for Google Maps integration (client-side)
NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY="your_google_maps_api_key"

# Optional: Google Analytics tracking ID
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"
```

## Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

Alternatively, you can deploy to any platform that supports Next.js applications.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev)

## License

Private
