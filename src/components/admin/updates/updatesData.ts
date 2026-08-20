import { SystemUpdateRelease, RoadmapItem } from './types';

export const SYSTEM_UPDATES: SystemUpdateRelease[] = [
  {
    id: 'rel-2026-08-20',
    date: '2026-08-20',
    formattedDate: '20 August 2026',
    version: 'v2.8.0',
    title: 'Luxury Corporate Email Branding & AI Speed Engine',
    summary:
      'Launched official SVI Infra luxury corporate email templates, high-speed AI letter generator with live timing, and flexible blank-mode editing.',
    category: 'Email & Marketing',
    isLatest: true,
    items: [
      {
        title: 'Official SVI Luxury Corporate Email Templates',
        description:
          'All outbound emails and AI-composed drafts now automatically use the official gold-and-navy executive template with high-resolution company branding, structured tables, and gold action buttons.',
        benefit: 'Creates a polished, premium brand impression on high-value property buyers.',
        tag: 'New Feature',
      },
      {
        title: 'Live AI Stopwatch & Instant Generation',
        description:
          'When generating an email with AI, the system now displays a real-time live timer showing exact generation speed (typically 2 to 3 seconds).',
        benefit: 'Provides transparent progress and confirms lightning-fast generation.',
        tag: 'Improvement',
      },
      {
        title: 'Template Deselect & Blank Mode Option',
        description:
          'Added a clear "Deselect Template" button and "None (Blank Editor)" option in the template selector dropdown so staff can easily switch between branded templates and standard plain messages.',
        benefit: 'Gives full flexibility to write custom quick notes without extra formatting.',
        tag: 'New Feature',
      },
      {
        title: 'Crystal Clear Email Previews (Mobile & Desktop)',
        description:
          'Upgraded the preview window to show exact desktop and mobile screen layouts without dark-mode color distortions or background color leakage.',
        benefit: 'Ensures what you see in the editor is exactly what clients see on their phones.',
        tag: 'Fix',
      },
      {
        title: 'System Performance & Speed Optimization',
        description:
          'Decomposed large administrative pages into lightweight modular components, reducing page weight and speeding up load times across all dashboards.',
        benefit: 'Snappy page switching with zero lag during daily office operations.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-16',
    date: '2026-08-16',
    formattedDate: '16 August 2026',
    version: 'v2.7.0',
    title: 'WhatsApp Sales Operations Center & Automated Takeover',
    summary:
      'Introduced a unified WhatsApp management portal connecting inbound client inquiries directly to AI assistance and sales staff.',
    category: 'WhatsApp Sales',
    items: [
      {
        title: 'Centralized WhatsApp Sales Inbox',
        description:
          'Sales staff can now view all incoming customer WhatsApp conversations from a single dashboard, with clear indicators of buyer interest and preferred properties.',
        benefit: 'Ensures no client inquiry goes missed or delayed.',
        tag: 'New Feature',
      },
      {
        title: '1-Click Agent Takeover & AI Handoff',
        description:
          'Staff can take over any active AI conversation with one click to send personalized messages, and hand back control to AI whenever needed.',
        benefit: 'Seamless balance between instant automated replies and personal human touch.',
        tag: 'New Feature',
      },
      {
        title: 'Customer Consent & Opt-Out Guard',
        description:
          'Built-in compliance checking prevents unwanted automated messages to clients who requested opt-out, maintaining high sender reputation.',
        benefit: 'Protects business reputation and avoids WhatsApp phone number penalties.',
        tag: 'Improvement',
      },
      {
        title: 'Direct Site Visit Scheduling',
        description:
          'Clients requesting site visits via WhatsApp are immediately highlighted with their requested date and project name in the side panel.',
        benefit: 'Accelerates lead-to-site-visit conversions for sales executives.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-08-12',
    date: '2026-08-12',
    formattedDate: '12 August 2026',
    version: 'v2.6.5',
    title: 'Visual Assets Refresh & Mobile Navigation Polish',
    summary:
      'High-resolution branding assets update, mobile header navigation improvements, and real-time error monitoring.',
    category: 'Security & Platform',
    items: [
      {
        title: 'High-Definition Company Logos & App Icons',
        description:
          'Updated all app icons, browser tab favicons, and corporate header crests to crystal-clear high-definition vector assets.',
        benefit: 'Crisp, professional appearance across all desktop monitors and mobile devices.',
        tag: 'Design & Speed',
      },
      {
        title: 'Mobile Header Touch Improvements',
        description:
          'Refined mobile header sticky behavior and touch responsiveness for smoother scrolling and effortless menu navigation on phones.',
        benefit: 'Smooth mobile browsing experience for on-the-go clients.',
        tag: 'Improvement',
      },
      {
        title: 'Proactive Error Logging & Monitoring',
        description:
          'Implemented 24/7 background error monitoring to detect and resolve any rare website issues before they affect end users.',
        benefit: 'Maintains uninterrupted platform availability and zero customer downtime.',
        tag: 'Security',
      },
    ],
  },
  {
    id: 'rel-2026-08-10',
    date: '2026-08-10',
    formattedDate: '10 August 2026',
    version: 'v2.6.0',
    title: 'Bilingual Legal Document Engine (English & Hindi)',
    summary:
      'Complete bilingual generation for Allotment Letters, Builder-Buyer Agreements (BBA), Offer Letters, and Quotations.',
    category: 'Documents & Legal',
    items: [
      {
        title: 'Bilingual Builder-Buyer Agreement (BBA)',
        description:
          'Full legal agreement generation with court-compliant wording available in both Hindi (भारतीय कानूनी प्रारूप) and English with automatic payment milestone schedules.',
        benefit: 'Reduces legal drafting time from hours to under 30 seconds.',
        tag: 'New Feature',
      },
      {
        title: '1-Click High-Quality PDF & Image Export',
        description:
          'All generated documents can be exported as print-ready PDF files or high-definition images with official company seals and signature spaces.',
        benefit: 'Instant delivery to buyers via email or printed for in-person handovers.',
        tag: 'Improvement',
      },
      {
        title: 'Digital Allotment & Offer Letter Records',
        description:
          'Searchable central archive of all issued customer allotment letters with complete revision history and customer contact details.',
        benefit: 'Eliminates lost paperwork and simplifies record auditing.',
        tag: 'Improvement',
      },
      {
        title: 'Ultra-Fast Data Compression Engine',
        description:
          'Enabled high-speed data compression across all administrative records, making large record lists open 3x faster.',
        benefit: 'Instant loading of extensive customer lists even on mobile data connections.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-08',
    date: '2026-08-08',
    formattedDate: '08 August 2026',
    version: 'v2.5.5',
    title: 'Telecaller Performance Targets & Offer Letter Terms',
    summary:
      'Added customizable monthly meeting targets for telecallers, refined sales performance clauses, and accelerated admin sign-in.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Customizable Monthly Meeting Targets for Telecallers',
        description:
          'Managers can set and track monthly client meeting targets for calling staff with live progress indicators.',
        benefit: 'Motivates telecalling team and provides clear visibility on daily targets.',
        tag: 'New Feature',
      },
      {
        title: 'Flexible Offer Letter Clauses & Relocation Terms',
        description:
          'Customizable employee performance clauses and office location relocation terms configurable per job role directly from the offer letter creator.',
        benefit: 'Tailored HR agreements matching specific sales and operations roles.',
        tag: 'Improvement',
      },
      {
        title: 'Accelerated Admin Dashboard Sign-In',
        description:
          'Streamlined authentication flow to eliminate login delays and give instant access to administrative tools.',
        benefit: 'Staff gets straight to work without waiting for dashboard loads.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-08-04',
    date: '2026-08-04',
    formattedDate: '04 August 2026',
    version: 'v2.5.0',
    title: 'Interactive Broker Commission & Exclusive Offers Suite',
    summary:
      'Launched modern broker engagement tools with real-time payout calculators and clear tier-based reward schedules.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Interactive Commission Calculator',
        description:
          'Brokers can adjust plot sizes and estimated sales values to immediately see their exact commission payout in Indian Rupees (INR).',
        benefit: 'Builds trust and transparency with external channel partners and brokers.',
        tag: 'New Feature',
      },
      {
        title: 'Direct WhatsApp Commission Claiming',
        description:
          'Pre-fills a customized WhatsApp message with plot dimensions and estimated payout when a broker clicks to claim their reward.',
        benefit: 'Shortens partner onboarding time and increases deal closing speed.',
        tag: 'Improvement',
      },
      {
        title: 'Shivani Vatika 11th Digital Township Showcase',
        description:
          'Launched interactive digital presentation showcasing project highlights, proximity to Khatu Shyam Ji / RIICO, and flexible 1 to 2-year no-cost EMI plans.',
        benefit: 'Empowers sales reps to present high-converting visuals on tablets or phones.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-08-01',
    date: '2026-08-01',
    formattedDate: '01 August 2026',
    version: 'v2.4.5',
    title: 'System Security Hardening & Calculator Enhancements',
    summary:
      'Comprehensive database permission lockdown, encryption upgrade, and accurate EMI calculation algorithms.',
    category: 'Security & Platform',
    items: [
      {
        title: 'High-Level Data Permission Security',
        description:
          'Secured all customer contact inquiries, grievances, and document records behind encrypted administrative verification.',
        benefit: '100% protection of client contact data from unauthorized external access.',
        tag: 'Security',
      },
      {
        title: 'Accurate Home Loan & EMI Estimator',
        description:
          'Updated the client-facing loan calculation engine with exact interest rate compounding and flexible loan tenures.',
        benefit: 'Gives prospective land buyers precise monthly financial estimates.',
        tag: 'Improvement',
      },
      {
        title: 'Fluid Theme & Bilingual Language Switcher',
        description:
          'Instant 1-click toggling between Hindi and English with full dark mode / light mode memory across all browser tabs.',
        benefit: 'Personalized reading comfort for both English and Hindi-speaking customers.',
        tag: 'Design & Speed',
      },
    ],
  },
  {
    id: 'rel-2026-07-28',
    date: '2026-07-28',
    formattedDate: '28 July 2026',
    version: 'v2.4.0',
    title: 'Transparent Lottery & Lucky Draw Engine',
    summary:
      'Automated plot lottery system for fair, randomized customer giveaways and special promotional events.',
    category: 'Staff & Operations',
    items: [
      {
        title: 'Admin Lottery Creation Wizard',
        description:
          'Step-by-step manager to create new property lottery events, set eligibility dates, and allocate giveaway plot numbers.',
        benefit: 'Enables marketing team to run high-engagement customer campaigns easily.',
        tag: 'New Feature',
      },
      {
        title: 'Live Draw & Winner Verification',
        description:
          'Visual randomizer that transparently draws winning ticket numbers with immediate SMS/WhatsApp status confirmation.',
        benefit: 'Ensures 100% fairness and builds unmatched customer trust.',
        tag: 'New Feature',
      },
      {
        title: 'Automated Token Number Generation',
        description:
          'Registered participants automatically receive unique verified tokens with instant receipt generation.',
        benefit: 'Smooth event management without physical token printing bottlenecks.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-05-28',
    date: '2026-05-28',
    formattedDate: '28 May 2026',
    version: 'v2.2.0',
    title: 'Email Center Hub & Smart Payment Scanner',
    summary:
      'Introduced central administrative email management and 3D acrylic UPI payment scanner modal.',
    category: 'Email & Marketing',
    items: [
      {
        title: 'Dedicated Admin Email Center',
        description:
          'Full-featured email client with inbox, sent history, drafts auto-save, trash recovery, and contact groups.',
        benefit: 'Streamlines all corporate email correspondence directly within the admin portal.',
        tag: 'New Feature',
      },
      {
        title: 'Official Bank Details & 3D UPI Payment Scanner',
        description:
          'Interactive payment modal with official IDBI bank accounts and scan-and-pay UPI QR code for direct application booking fees.',
        benefit: 'Simplifies instant token payments for land plot bookings.',
        tag: 'New Feature',
      },
    ],
  },
  {
    id: 'rel-2026-05-19',
    date: '2026-05-19',
    formattedDate: '19 May 2026',
    version: 'v2.1.0',
    title: 'Document Generator & Staff Attendance Management',
    summary:
      'Automated generation of official payment receipts with amount-to-words conversion and staff attendance logging.',
    category: 'Documents & Legal',
    items: [
      {
        title: 'Instant Payment Receipts with Number-to-Words',
        description:
          'Generates official receipts with automatic conversion of numerical Rupees to words (e.g. ₹5,00,000 -> Five Lakh Rupees Only).',
        benefit: 'Prevents manual human calculation mistakes on customer payment receipts.',
        tag: 'New Feature',
      },
      {
        title: 'Staff Daily Attendance Management',
        description:
          'Interactive attendance tracker with team-level analytics, monthly summaries, and punctuality monitoring.',
        benefit: 'Eliminates paper registers and simplifies payroll review.',
        tag: 'New Feature',
      },
      {
        title: 'Progressive Web App (PWA) Offline Access',
        description:
          'Installed progressive web app support allowing staff to install the portal onto phone home screens for offline viewing.',
        benefit: 'Quick 1-tap mobile launch just like a native mobile app.',
        tag: 'Improvement',
      },
    ],
  },
  {
    id: 'rel-2026-05-15',
    date: '2026-05-15',
    formattedDate: '15 May 2026',
    version: 'v2.0.0',
    title: 'Foundation Launch: SVI Infra Solutions Corporate Platform',
    summary:
      'Inaugural launch of the next-generation bilingual real estate portal, customer inquiry system, and admin control suite.',
    category: 'Security & Platform',
    items: [
      {
        title: 'Next-Generation Bilingual Portal (Hindi & English)',
        description:
          'Comprehensive real estate website showcasing ongoing & completed projects (Shivani Vatika, Shyam Aangan) with bilingual content.',
        benefit: 'Broadens audience reach across Rajasthan, Delhi-NCR, and North India.',
        tag: 'New Feature',
      },
      {
        title: 'Interactive Leadership Hierarchy Chart',
        description:
          'Executive presentation of company founders Mr. Illas Ali and Mr. Vinod Kumar with interactive company structure.',
        benefit: 'Builds strong investor confidence and corporate credibility.',
        tag: 'New Feature',
      },
      {
        title: '24/7 AI Chatbot & Lead Capture',
        description:
          'Smart bilingual assistant that greets website visitors, answers project queries, and securely captures phone numbers.',
        benefit: 'Captures hot buyer leads 24/7 even after office hours.',
        tag: 'New Feature',
      },
    ],
  },
];

export const UPCOMING_ROADMAP: RoadmapItem[] = [
  {
    title: 'Automated WhatsApp Campaign Broadcasts',
    targetQuarter: 'Q3 2026',
    category: 'WhatsApp Sales',
    description:
      'Schedule bulk personalized WhatsApp updates to pre-qualified buyer lists with image brochures and direct callback options.',
    status: 'In Development',
  },
  {
    title: 'Smart Payment Installment Reminders',
    targetQuarter: 'Q4 2026',
    category: 'Documents & Legal',
    description:
      'Automated gentle SMS and email reminders sent 7 days before plot installment due dates with direct online payment links.',
    status: 'Testing',
  },
  {
    title: 'Client Portal 3D Site Navigation',
    targetQuarter: 'Q4 2026',
    category: 'Staff & Operations',
    description:
      'Interactive 3D plot map where buyers can check sold vs. available plots in real time with sun-orientation indicators.',
    status: 'Planned',
  },
  {
    title: 'Advanced Sales Executive Performance Analytics',
    targetQuarter: 'Q1 2027',
    category: 'Staff & Operations',
    description:
      'Visual breakdown of site visits completed, conversion ratios, and average closing times per team member.',
    status: 'Planned',
  },
];
