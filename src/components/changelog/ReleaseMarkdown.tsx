/**
 * Tiny, dependency-free markdown renderer scoped to GitHub release notes.
 *
 * It is *not* a full CommonMark implementation — it covers the small surface
 * GitHub actually emits in release bodies:
 *
 *   - ATX headings (## / ### / ####)
 *   - Paragraphs separated by blank lines
 *   - Unordered (-, *) and ordered (1.) lists
 *   - Inline `code`, **bold**, *italic*, ~~strike~~
 *   - `[text](url)` links, including GitHub's "@user" auto-links
 *   - Fenced code blocks ``` ```
 *   - Blockquotes (> ...)
 *   - Horizontal rules (---)
 *
 * The output is built with React elements (no dangerouslySetInnerHTML), so the
 * raw markdown source is treated as text at every step. A defensive HTML
 * escaper neutralises anything that would otherwise try to inject markup.
 */
import { Fragment, type JSX } from 'react';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Match raw URLs, but stop at trailing punctuation common in prose. */
const URL_REGEX = /https?:\/\/[^\s<>()]+[^\s<>().,;:!?"'`{}|\\]/g;

/** @user / @org mention auto-link. */
const MENTION_REGEX = /(?:^|\s)@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}))/g;

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Only allow http(s), mailto, and relative same-origin links
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }
  return null;
}

interface InlineToken {
  type: 'text' | 'code' | 'bold' | 'italic' | 'strike' | 'link' | 'autolink' | 'mention';
  value: string;
  href?: string;
}

/**
 * Tokenize a single line of inline markdown into a list of segments. Order
 * matters — the longest matchers run first so `**bold**` wins over `*italic*`
 * and backticks win over both.
 */
function tokenizeInline(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;

  while (i < line.length) {
    // Inline code: `code` — content kept literal
    if (line[i] === '`') {
      const end = line.indexOf('`', i + 1);
      if (end > i) {
        tokens.push({ type: 'code', value: line.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Image: ![alt](src) — we don't render images in release notes, but skip
    // the syntax so it doesn't leak through as raw text.
    if (line[i] === '!' && line[i + 1] === '[') {
      const close = line.indexOf(']', i + 2);
      if (close > i && line[close + 1] === '(') {
        const urlEnd = line.indexOf(')', close + 2);
        if (urlEnd > close) {
          i = urlEnd + 1;
          continue;
        }
      }
    }

    // Link: [text](url)
    if (line[i] === '[') {
      const close = line.indexOf(']', i + 1);
      if (close > i && line[close + 1] === '(') {
        const urlEnd = line.indexOf(')', close + 2);
        if (urlEnd > close) {
          const text = line.slice(i + 1, close);
          const url = sanitizeUrl(line.slice(close + 2, urlEnd));
          if (url) {
            tokens.push({ type: 'link', value: text, href: url });
            i = urlEnd + 1;
            continue;
          }
        }
      }
    }

    // Bold: **text** or __text__
    if (line[i] === '*' && line[i + 1] === '*') {
      const end = line.indexOf('**', i + 2);
      if (end > i + 1) {
        tokens.push({ type: 'bold', value: line.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (line[i] === '_' && line[i + 1] === '_') {
      const end = line.indexOf('__', i + 2);
      if (end > i + 1) {
        tokens.push({ type: 'bold', value: line.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text* or _text_ (but not inside a word)
    if (line[i] === '*' && line[i + 1] !== '*') {
      const end = line.indexOf('*', i + 1);
      if (end > i) {
        tokens.push({ type: 'italic', value: line.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (line[i] === '_' && line[i + 1] !== '_') {
      const end = line.indexOf('_', i + 1);
      const prevChar = i > 0 ? line[i - 1] : ' ';
      const nextChar = end > i ? (line[end + 1] ?? ' ') : ' ';
      if (end > i && !/[a-zA-Z0-9]/.test(prevChar) && !/[a-zA-Z0-9]/.test(nextChar)) {
        tokens.push({ type: 'italic', value: line.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Strikethrough: ~~text~~
    if (line[i] === '~' && line[i + 1] === '~') {
      const end = line.indexOf('~~', i + 2);
      if (end > i + 1) {
        tokens.push({ type: 'strike', value: line.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // Plain text — collect until the next interesting character
    let next = i + 1;
    while (next < line.length) {
      const c = line[next];
      if (
        c === '`' ||
        c === '[' ||
        c === '*' ||
        c === '_' ||
        c === '~' ||
        c === '!' ||
        c === 'h' ||
        c === 'H'
      ) {
        // Only stop at 'h' / 'H' if it could start a URL
        if (c === 'h' || c === 'H') {
          if (!/https?:\/\//.test(line.slice(next))) {
            next++;
            continue;
          }
        }
        break;
      }
      next++;
    }
    const text = line.slice(i, next);
    if (text) tokens.push({ type: 'text', value: text });
    i = next;
  }

  // After collecting raw text tokens, split them around URLs and @mentions.
  const expanded: InlineToken[] = [];
  for (const token of tokens) {
    if (token.type !== 'text') {
      expanded.push(token);
      continue;
    }
    const value = token.value;
    let lastIndex = 0;
    const matches: Array<{
      start: number;
      end: number;
      kind: 'url' | 'mention';
      value: string;
      href: string;
    }> = [];

    for (const match of value.matchAll(URL_REGEX)) {
      const start = match.index ?? 0;
      matches.push({
        start,
        end: start + match[0].length,
        kind: 'url',
        value: match[0],
        href: match[0],
      });
    }
    for (const match of value.matchAll(MENTION_REGEX)) {
      const start = (match.index ?? 0) + (match[0].startsWith('@') ? 0 : 1);
      const username = match[1];
      matches.push({
        start,
        end: start + 1 + username.length,
        kind: 'mention',
        value: `@${username}`,
        href: `https://github.com/${username}`,
      });
    }

    matches.sort((a, b) => a.start - b.start);

    for (const m of matches) {
      if (m.start < lastIndex) continue; // overlap, skip
      if (m.start > lastIndex) {
        expanded.push({ type: 'text', value: value.slice(lastIndex, m.start) });
      }
      expanded.push(
        m.kind === 'url'
          ? { type: 'autolink', value: m.value, href: m.href }
          : { type: 'mention', value: m.value, href: m.href }
      );
      lastIndex = m.end;
    }
    if (lastIndex < value.length) {
      expanded.push({ type: 'text', value: value.slice(lastIndex) });
    }
  }

  return expanded;
}

function renderInline(line: string, keyPrefix: string): JSX.Element[] {
  return tokenizeInline(line).map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (token.type) {
      case 'code':
        return (
          <code
            key={key}
            className="text-brand-navy rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-gray-800 dark:text-gray-100"
          >
            {token.value}
          </code>
        );
      case 'bold':
        return (
          <strong key={key} className="text-brand-navy font-semibold dark:text-gray-100">
            {renderInline(token.value, `${key}-b`)}
          </strong>
        );
      case 'italic':
        return <em key={key}>{renderInline(token.value, `${key}-i`)}</em>;
      case 'strike':
        return (
          <s key={key} className="text-gray-500">
            {renderInline(token.value, `${key}-s`)}
          </s>
        );
      case 'link':
      case 'autolink':
      case 'mention': {
        const href = sanitizeUrl(token.href ?? '');
        if (!href) return <Fragment key={key}>{escapeHtml(token.value)}</Fragment>;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:text-brand-gold-dark underline underline-offset-2 transition-colors"
          >
            {token.value}
          </a>
        );
      }
      default:
        return <Fragment key={key}>{token.value}</Fragment>;
    }
  });
}

interface Block {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'quote' | 'hr';
  level?: number;
  items?: string[]; // for list
  ordered?: boolean;
  text?: string; // for paragraph / heading / quote
  lang?: string; // for code
}

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, '');

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || undefined;
      const buffer: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buffer.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: 'code', lang, text: buffer.join('\n') });
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Heading
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      i++;
      continue;
    }

    // Blockquote (one-line or multi-line; collect until blank line)
    if (line.startsWith('>')) {
      const buffer: string[] = [];
      while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
        if (lines[i].trim() === '' && buffer.length > 0) break;
        buffer.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: buffer.join('\n').trim() });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Paragraph: collect until blank line / block start
    const buffer: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !/^[-*+]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim())
    ) {
      buffer.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: buffer.join('\n') });
  }

  return blocks;
}

export function ReleaseMarkdown({ source }: { source: string }) {
  if (!source || !source.trim()) {
    return (
      <p className="text-sm text-gray-500 italic dark:text-gray-400">
        No release notes were provided for this release.
      </p>
    );
  }
  const blocks = parse(source);
  return (
    <div className="release-markdown space-y-4 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
      {blocks.map((block, idx) => {
        const key = `b-${idx}`;
        switch (block.type) {
          case 'heading': {
            const level = Math.min(Math.max(block.level ?? 2, 2), 4);
            const size =
              level === 2
                ? 'text-xl md:text-2xl'
                : level === 3
                  ? 'text-lg md:text-xl'
                  : 'text-base md:text-lg';
            const content = renderInline(block.text ?? '', key);
            if (level === 2)
              return (
                <h2
                  key={key}
                  className={`text-brand-navy mt-6 mb-2 font-serif font-semibold tracking-tight first:mt-0 dark:text-gray-100 ${size}`}
                >
                  {content}
                </h2>
              );
            if (level === 3)
              return (
                <h3
                  key={key}
                  className={`text-brand-navy mt-5 mb-2 font-serif font-semibold tracking-tight dark:text-gray-100 ${size}`}
                >
                  {content}
                </h3>
              );
            return (
              <h4
                key={key}
                className={`text-brand-navy mt-4 mb-2 font-serif font-semibold tracking-tight dark:text-gray-100 ${size}`}
              >
                {content}
              </h4>
            );
          }
          case 'paragraph':
            return (
              <p key={key} className="text-[15px] leading-relaxed">
                {renderInline(block.text ?? '', key)}
              </p>
            );
          case 'list': {
            const ordered = !!block.ordered;
            const Tag = ordered ? 'ol' : 'ul';
            return (
              <Tag
                key={key}
                className={`space-y-2 pl-6 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-brand-gold/70`}
              >
                {(block.items ?? []).map((item, j) => (
                  <li key={`${key}-${j}`} className="pl-1">
                    {renderInline(item, `${key}-${j}`)}
                  </li>
                ))}
              </Tag>
            );
          }
          case 'code':
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-sm text-gray-100 shadow-sm dark:border-gray-700"
              >
                <code className="font-mono text-[13px] leading-relaxed">{block.text}</code>
              </pre>
            );
          case 'quote':
            return (
              <blockquote
                key={key}
                className="border-brand-gold/40 bg-brand-gold/5 text-brand-navy/80 rounded-r-lg border-l-4 py-3 pr-3 pl-4 italic dark:text-gray-300"
              >
                {renderInline(block.text ?? '', key)}
              </blockquote>
            );
          case 'hr':
            return <hr key={key} className="border-gray-200 dark:border-gray-700" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
