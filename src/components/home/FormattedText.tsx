'use client';

import { type ReactNode, Fragment } from 'react';

// ─── Regex patterns ──────────────────────────────────────────────────────
const URL_PATTERN = /(https?:\/\/[^\s<]+)/gi;
const PHONE_PATTERN = /(\+91[-\s]?[6-9]\d{9}|[6-9]\d{9})/g;
const PRICE_PATTERN =
  /(₹\s?[\d,]+(?:,\d{3})*(?:\.\d{1,2})?|\b\d[\d,]*\d\s*(?:lakh|lac|crore|cr)\b)/gi;
const KEYWORD_PATTERN =
  /\b(contact us|call us|visit|book now|register now|schedule|brochure|download|enquire now|get in touch)\b/gi;

interface MatchResult {
  type: 'url' | 'phone' | 'price' | 'keyword' | 'text';
  text: string;
  index: number;
}

function tokenize(text: string): MatchResult[] {
  const results: MatchResult[] = [];
  const combined = new RegExp(
    `(${URL_PATTERN.source})|(${PHONE_PATTERN.source})|(${PRICE_PATTERN.source})|(${KEYWORD_PATTERN.source})`,
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
    if (matched.match(URL_PATTERN)) {
      results.push({ type: 'url', text: matched, index: results.length });
    } else if (matched.match(PHONE_PATTERN)) {
      results.push({ type: 'phone', text: matched, index: results.length });
    } else if (matched.match(PRICE_PATTERN)) {
      results.push({ type: 'price', text: matched, index: results.length });
    } else if (matched.match(KEYWORD_PATTERN)) {
      results.push({ type: 'keyword', text: matched, index: results.length });
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
          className="text-brand-gold hover:text-brand-gold-light font-semibold underline underline-offset-2 transition-colors"
        >
          {item.text}
        </a>
      );

    case 'price':
      return (
        <span className="text-brand-navy dark:text-brand-gold font-semibold">{item.text}</span>
      );

    case 'keyword':
      return (
        <span className="bg-brand-gold/10 text-brand-navy dark:text-brand-gold-dark rounded-sm px-0.5 font-medium">
          {item.text}
        </span>
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
    <span className={`whitespace-pre-wrap ${className}`}>
      {tokens.map((item) => (
        <FormattedTextSegment key={`${item.index}-${item.type}`} item={item} />
      ))}
    </span>
  );
}
