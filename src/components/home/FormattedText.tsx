'use client';

import Link from 'next/link';

// ─── Regex patterns ──────────────────────────────────────────────────────
const URL_PATTERN = /(https?:\/\/[^\s<]+)/gi;

const PHONE_PATTERN = /(\+91[-\s]?[6-9]\d{9}|[6-9]\d{9}(?![*\d]))/g;

const EMAIL_PATTERN = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

const PRICE_PATTERN =
  /(₹\s?[\d,]+(?:,\d{3})*(?:\.\d{1,2})?|\b\d[\d,]*\d\s*(?:lakh|lac|crore|cr)\b)/gi;

const PERCENT_PATTERN = /\b(\d+(?:\.\d+)?%)\b/g;

const PROPERTY_SIZE_PATTERN =
  /\b(\d+(?:[-\s]\d+)?\s*(?:sq\.?\s*(?:ft|feet|yrd|yard|m|meter)|BHK|bedroom|acre|hectare))\b/gi;

const LOCATION_PATTERN =
  /\b(Jaipur|Noida|Phulera|Rajasthan|Uttar Pradesh|Delhi|Gurgaon(?:on)?|Lucknow|Mumbai|Bengaluru|DMIC|DFC)\b/gi;

const COMPANY_PATTERN = /\b(SVI Infra(?: Solutions)?)\b/gi;

const KEYWORD_PATTERN =
  /\b(contact us|call us|visit|book now|register now|schedule|brochure|download|enquire now|get in touch|site visit|customercare|helpdesk|office)\b/gi;

const DATE_PATTERN =
  /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{0,4}|today|tomorrow|next week|next month)\b/gi;

// Internal page paths like /projects, /contact, /about, etc.
const PAGE_PATH_PATTERN =
  /(\/(?:projects(?:\/(?:current|completed))?|about|contact|faq|registration|lottery|careers|leadership|privacy-policy|terms-conditions|thank-you|grievance|payment|blog(?:\/[a-z0-9-]+)?))\b/gi;

interface MatchResult {
  type:
    | 'url'
    | 'phone'
    | 'email'
    | 'price'
    | 'percent'
    | 'property-size'
    | 'location'
    | 'company'
    | 'keyword'
    | 'date'
    | 'page-path'
    | 'text';
  text: string;
  index: number;
}

function tokenize(text: string): MatchResult[] {
  const results: MatchResult[] = [];
  const combined = new RegExp(
    [
      `(${URL_PATTERN.source})`,
      `(${PHONE_PATTERN.source})`,
      `(${EMAIL_PATTERN.source})`,
      `(${PAGE_PATH_PATTERN.source})`,
      `(${COMPANY_PATTERN.source})`,
      `(${PRICE_PATTERN.source})`,
      `(${PERCENT_PATTERN.source})`,
      `(${PROPERTY_SIZE_PATTERN.source})`,
      `(${LOCATION_PATTERN.source})`,
      `(${KEYWORD_PATTERN.source})`,
      `(${DATE_PATTERN.source})`,
    ]
      .map((s) => s.replace(/\/[gimsu]*$/, '').replace(/^\//, ''))
      .join('|'),
    'gi'
  );

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      results.push({
        type: 'text',
        text: text.slice(lastIndex, match.index),
        index: results.length,
      });
    }

    const matched = match[0];

    // Determine type by checking which group matched (order matters: most specific first)
    if (matched.match(URL_PATTERN)) {
      results.push({ type: 'url', text: matched, index: results.length });
    } else if (matched.match(PHONE_PATTERN)) {
      results.push({ type: 'phone', text: matched, index: results.length });
    } else if (matched.match(EMAIL_PATTERN)) {
      results.push({ type: 'email', text: matched, index: results.length });
    } else if (matched.match(PAGE_PATH_PATTERN)) {
      results.push({ type: 'page-path', text: matched, index: results.length });
    } else if (matched.match(COMPANY_PATTERN)) {
      results.push({ type: 'company', text: matched, index: results.length });
    } else if (matched.match(PRICE_PATTERN)) {
      results.push({ type: 'price', text: matched, index: results.length });
    } else if (matched.match(PERCENT_PATTERN)) {
      results.push({ type: 'percent', text: matched, index: results.length });
    } else if (matched.match(PROPERTY_SIZE_PATTERN)) {
      results.push({ type: 'property-size', text: matched, index: results.length });
    } else if (matched.match(LOCATION_PATTERN)) {
      results.push({ type: 'location', text: matched, index: results.length });
    } else if (matched.match(KEYWORD_PATTERN)) {
      results.push({ type: 'keyword', text: matched, index: results.length });
    } else if (matched.match(DATE_PATTERN)) {
      results.push({ type: 'date', text: matched, index: results.length });
    }

    lastIndex = match.index + matched.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    results.push({ type: 'text', text: text.slice(lastIndex), index: results.length });
  }

  return results;
}

function formatPhoneHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  return `tel:+91${digits.length === 10 ? digits : digits.slice(0, 10)}`;
}

function locationSearchUrl(location: string): string {
  const q = encodeURIComponent(`${location} India real estate`);
  return `/projects/current?location=${encodeURIComponent(location)}`;
}

function FormattedTextSegment({ item }: { item: MatchResult }) {
  switch (item.type) {
    case 'url':
      return (
        <a
          href={item.text}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-gold hover:text-brand-gold-light underline underline-offset-2 transition-colors"
        >
          {item.text}
        </a>
      );

    case 'phone':
      return (
        <a
          href={formatPhoneHref(item.text)}
          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-700 underline underline-offset-2 transition-colors hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
          </svg>
          {item.text}
        </a>
      );

    case 'email':
      return (
        <a
          href={`mailto:${item.text}`}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700 underline underline-offset-2 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          {item.text}
        </a>
      );

    case 'page-path':
      return (
        <Link
          href={item.text}
          className="bg-brand-gold/10 text-brand-navy hover:bg-brand-gold/20 dark:bg-brand-gold/5 dark:text-brand-gold dark:hover:bg-brand-gold/10 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm font-medium underline underline-offset-2 transition-colors"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-4v8h-2V5.42l-9.3 9.3-1.42-1.42L17.58 4H14V2h7z" />
          </svg>
          {item.text}
        </Link>
      );

    case 'price':
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          {item.text}
        </span>
      );

    case 'percent':
      return <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.text}</span>;

    case 'property-size':
      return (
        <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-sm font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
          {item.text}
        </span>
      );

    case 'location':
      return (
        <Link
          href={locationSearchUrl(item.text)}
          className="inline-flex items-center gap-0.5 rounded-md bg-orange-50 px-1.5 py-0.5 text-sm font-semibold text-orange-700 underline underline-offset-2 transition-colors hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
          {item.text}
        </Link>
      );

    case 'company':
      return (
        <Link
          href="/about"
          className="bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/20 dark:bg-brand-gold/20 dark:text-brand-gold dark:hover:bg-brand-gold/30 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-sm font-bold underline underline-offset-2 transition-colors"
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 2v2.343A7.98 7.98 0 0012 4c1.163 0 2.27.248 3.273.692L16 2h-2l-1 3h-2l-1-3H8l.727 2.692A7.98 7.98 0 0012 6c.702 0 1.378.09 2.025.256L14 9h-4l-1 2h6l-.5 1H9.5L9 14h6l-.5 1h-5l-.5 1h6l-.5 1H12v4h-2v-3.5l-3-1v-6l-2-1v-2l2-1V2z" />
          </svg>
          {item.text}
        </Link>
      );

    case 'keyword':
      return (
        <span className="bg-brand-gold/15 text-brand-gold-dark dark:bg-brand-gold/10 dark:text-brand-gold inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold">
          {item.text}
        </span>
      );

    case 'date':
      return (
        <span className="font-medium text-gray-600 italic dark:text-gray-400">{item.text}</span>
      );

    default:
      return <>{item.text}</>;
  }
}

interface FormattedTextProps {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  const tokens = tokenize(text);

  return (
    <span className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {tokens.map((item) => (
        <FormattedTextSegment key={`${item.index}-${item.type}`} item={item} />
      ))}
    </span>
  );
}
