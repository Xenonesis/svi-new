/**
 * Extract unique variables (e.g. {{variable}}) from an HTML template string.
 * It strips mustache control/block characters like #, /, ^, &, >, etc.
 */
export const extractTemplateVars = (html: string): string[] => {
  const matches = html.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const cleanVars = matches
    .map((m) =>
      m
        .replace(/<[^>]+>/g, '') // Strip any stray HTML tags (e.g. <strong>, <em>) inside brackets
        .replace(/[{}]/g, '')
        .replace(/^[#/^>&]/, '')
        .trim()
    )
    .filter(Boolean);
  return [...new Set(cleanVars)];
};

/**
 * Sanitize and normalize email HTML strings.
 * Cleans escaped quotes (\"), literal backslash-n sequences (\\n),
 * and corrupted attribute values so that browsers never display raw \n text or broken images.
 */
export const sanitizeEmailHtml = (html: string | null | undefined): string => {
  if (!html || typeof html !== 'string') return '';
  let result = html;

  // 1. Unescape double backslashes before quotes: \\" -> "
  result = result.replace(/\\\\"/g, '"');
  result = result.replace(/\\\\'/g, "'");

  // 2. Unescape single backslash before quotes: \" -> " and \' -> '
  result = result.replace(/\\"/g, '"');
  result = result.replace(/\\'/g, "'");

  // 3. Convert literal string "\r\n", "\n", "\r" (backslash + n) to real newline whitespace
  // This prevents browsers from rendering visible "\n \n" text between tags or in text nodes
  result = result.replace(/\\r\\n/g, '\n');
  result = result.replace(/\\n/g, '\n');
  result = result.replace(/\\r/g, '\n');
  result = result.replace(/\\t/g, ' ');

  // 4. Clean up corrupted src/alt/href attributes with leading backslashes or stray escaped quotes
  result = result.replace(/(src|alt|href)=["']\\+["']?([^"']+)["']/gi, '$1="$2"');
  result = result.replace(/(src|alt|href)=["']\\+([^"']+)["']/gi, '$1="$2"');

  // 5. Clean up any literal "\n" remaining between tags or at start of document
  result = result.replace(/(>|^)(\s*\\n\s*)+(<|$)/g, '$1\n$3');

  // 6. Normalize SVI official corporate logo URL
  // Fix non-www domain (which causes TLS cert mismatch) and relative paths
  result = result.replace(
    /https?:\/\/sviinfrasolutions\.com\/logo\.png/gi,
    'https://www.sviinfrasolutions.com/logo.png'
  );
  result = result.replace(
    /src=["']\/?logo\.png["']/gi,
    'src="https://www.sviinfrasolutions.com/logo.png"'
  );

  // 7. Ensure dark header banners never contain dark-on-dark text and wrap naked logo in white capsule
  result = result.replace(
    /(<td[^>]*style=["'][^"']*(?:linear-gradient|#07111e|#0f172a|#1a2744|#0a1526|#070d18)[^"']*["'][^>]*>[\s\S]*?)(<\/td>)/gi,
    (_match, headerContent, tdClose) => {
      let fixedHeader = headerContent;

      // Wrap naked logo in clean white pill capsule if missing
      if (
        !fixedHeader.includes('background-color:#ffffff') &&
        !fixedHeader.includes('background:#ffffff')
      ) {
        fixedHeader = fixedHeader.replace(
          /(<img[^>]*src=["'][^"']*logo\.png["'][^>]*>)/gi,
          `<div style="display:inline-block;background-color:#ffffff;padding:8px 22px;border-radius:24px;box-shadow:0 4px 14px rgba(0,0,0,0.25);margin-bottom:14px;">$1</div>`
        );
      }

      // Remove redundant "SVI INFRA SOLUTIONS" paragraph in header if logo is already present
      fixedHeader = fixedHeader.replace(
        /<p[^>]*>\s*SVI\s+INFRA\s+SOLUTIONS(?:\s+PVT\.?\s*LTD\.?)?\s*<\/p>/gi,
        ''
      );

      // Fix accidental dark text styles in dark header banner to crisp white
      fixedHeader = fixedHeader.replace(
        /color:\s*(?:#0f172a|#334155|#1e293b|#475569|#64748b|#000000|black)/gi,
        'color:#ffffff'
      );

      return fixedHeader + tdClose;
    }
  );

  return result.trim();
};

/**
 * Replace variables and evaluate conditional blocks (e.g. {{#key}}...{{/key}})
 * in an HTML template string based on provided template variables.
 */
export const getPreviewHtml = (
  sourceHtml: string | null,
  templateVars: Record<string, string>
): string => {
  if (!sourceHtml) return '';
  let result = sanitizeEmailHtml(sourceHtml);

  // 1. Process conditional blocks first: {{#key}}...{{/key}}
  const conditionalRegex = /\{\{#([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(conditionalRegex, (match, key, content) => {
    const value = templateVars[key];
    if (value !== undefined && value !== null && value !== '') {
      return content;
    }
    return '';
  });

  // 2. Process standard variables - replace if value provided, tolerating inner formatting tags
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Object.entries(templateVars).forEach(([key, value]) => {
    const pattern = new RegExp(
      '\\{\\{(?:<[^>]+>)*' + escapeRegExp(key) + '(?:<[^>]+>)*\\}\\}',
      'gi'
    );
    result = result.replace(
      pattern,
      value !== undefined && value !== null && value.trim() !== '' ? value : '{{' + key + '}}'
    );
  });
  return result;
};

/**
 * Remove empty/residual container tags left behind when content is deleted.
 */
export const cleanEmptyTags = (html: string): string => {
  if (!html) return html;
  let prev = '';
  let curr = html;
  // Iterate until all empty nested tags are removed
  while (prev !== curr) {
    prev = curr;
    curr = curr
      .replace(/<li[^>]*>\s*<\/li>/gi, '')
      .replace(/<ol[^>]*>\s*<\/ol>/gi, '')
      .replace(/<ul[^>]*>\s*<\/ul>/gi, '')
      .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '')
      .replace(/<p[^>]*>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
      .replace(/<span[^>]*>\s*<\/span>/gi, '')
      .replace(/<div style="[^"]*border:[^"]*"[^>]*>\s*<\/div>/gi, '');
  }
  return curr;
};

/**
 * Safe targeted text replacement inside HTML content.
 * Replaces only the text matching `original`, preserving all parent table/card structures.
 */
export const safeReplaceHtmlContent = (
  sourceHtml: string,
  original: string,
  replacement: string
): string => {
  if (!sourceHtml || !original.trim()) return sourceHtml;
  const cleanOrig = original.trim();

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getRegexForCharOrWord = (str: string) => {
    if (str === '&') return '(?:&amp;|&)';
    if (str === '<') return '(?:&lt;|<)';
    if (str === '>') return '(?:&gt;|>)';
    if (str === '"' || str === '“' || str === '”') return '(?:&quot;|&ldquo;|&rdquo;|"|“|”)';
    if (str === "'" || str === '‘' || str === '’') return "(?:&#39;|&rsquo;|&lsquo;|'|’|‘)";
    if (str === '—' || str === '–' || str === '-') return '(?:&mdash;|&ndash;|—|–|--|-)';
    if (str === ' ') return '(?:\\s+|&nbsp;)';
    return escapeRegex(str);
  };

  // 1. Direct exact match
  if (sourceHtml.includes(original)) {
    const res = sourceHtml.replace(original, replacement);
    return !replacement.trim() ? cleanEmptyTags(res) : res;
  }

  // 2. Exact trimmed match
  if (sourceHtml.includes(cleanOrig)) {
    const res = sourceHtml.replace(cleanOrig, replacement);
    return !replacement.trim() ? cleanEmptyTags(res) : res;
  }

  // 3. Tokenize by words, punctuation, spaces, emojis with HTML entity resilience
  const tokens = cleanOrig.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]|\s+/gu);
  if (tokens && tokens.length > 0) {
    const patternParts = tokens
      .filter((t) => !/^\s+$/.test(t))
      .map((t) => {
        if (t.length === 1) return getRegexForCharOrWord(t);
        return escapeRegex(t);
      });

    const regexStr = patternParts.join('(?:\\s+|&nbsp;|<[^>]*>)*');
    try {
      const flexibleRegex = new RegExp(regexStr, 'iu');
      if (flexibleRegex.test(sourceHtml)) {
        const res = sourceHtml.replace(flexibleRegex, replacement);
        return !replacement.trim() ? cleanEmptyTags(res) : res;
      }
    } catch {
      // Fallback below
    }
  }

  // 4. Line-by-line fallback for multi-line block selections
  const lines = cleanOrig
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  if (lines.length > 1) {
    let currentHtml = sourceHtml;
    let anyReplaced = false;
    for (const line of lines) {
      const lineTokens = line.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]|\s+/gu);
      if (lineTokens && lineTokens.length > 0) {
        const lineParts = lineTokens
          .filter((t) => !/^\s+$/.test(t))
          .map((t) => (t.length === 1 ? getRegexForCharOrWord(t) : escapeRegex(t)));
        const lineRegexStr = lineParts.join('(?:\\s+|&nbsp;|<[^>]*>)*');
        try {
          const lineRegex = new RegExp(lineRegexStr, 'iu');
          if (lineRegex.test(currentHtml)) {
            currentHtml = currentHtml.replace(lineRegex, replacement ? replacement : '');
            anyReplaced = true;
          }
        } catch {
          // Continue loop
        }
      }
    }
    if (anyReplaced) {
      return !replacement.trim() ? cleanEmptyTags(currentHtml) : currentHtml;
    }
  }

  return sourceHtml;
};

/**
 * Safe targeted replacement in template HTML or template variables.
 * If the selected original text matches a variable value in templateVars (partially or fully),
 * or is in templateHtml (directly or in the resolved HTML), this replaces it non-destructively
 * without breaking table/card structures.
 */
export const safeReplaceTemplateContent = (
  templateHtml: string,
  templateVars: Record<string, string>,
  original: string,
  replacement: string
): { updatedTemplate: string; updatedVars: Record<string, string>; changed: boolean } => {
  if (!original || !original.trim()) {
    return { updatedTemplate: templateHtml, updatedVars: templateVars, changed: false };
  }

  const cleanOrig = original.trim();
  const cleanReplacement = replacement.trim();
  const updatedVars = { ...templateVars };
  let updatedTemplate = templateHtml;
  let changed = false;

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1. Check if original matches or is part of any template variable
  const matchedVarKeys: string[] = [];
  for (const [key, val] of Object.entries(templateVars)) {
    if (!val) continue;
    if (val.trim() === cleanOrig) {
      matchedVarKeys.push(key);
      updatedVars[key] = replacement;
      changed = true;
    } else if (val.includes(cleanOrig)) {
      matchedVarKeys.push(key);
      updatedVars[key] = val.replace(cleanOrig, replacement);
      changed = true;
    }
  }

  // 2. For any matched variable, update or remove placeholder in templateHtml if present
  for (const key of matchedVarKeys) {
    const varPattern = new RegExp(
      '\\{\\{(?:<[^>]+>)*' + escapeRegex(key) + '(?:<[^>]+>)*\\}\\}',
      'gi'
    );
    if (varPattern.test(updatedTemplate)) {
      if (!cleanReplacement) {
        // If deleted, remove placeholder from templateHtml so it doesn't display raw {{key}}
        updatedTemplate = updatedTemplate.replace(varPattern, '');
      } else {
        // Concrete replacement in template with the fully resolved variable value
        updatedTemplate = updatedTemplate.replace(varPattern, updatedVars[key]);
      }
      changed = true;
    }
  }

  // 3. Try direct replacement in templateHtml (for static text)
  const directReplaced = safeReplaceHtmlContent(updatedTemplate, original, replacement);
  if (directReplaced !== updatedTemplate) {
    updatedTemplate = directReplaced;
    changed = true;
  }

  // 4. If still not changed and templateHtml exists, try replacement against resolved preview HTML
  if (!changed && templateHtml) {
    const resolved = getPreviewHtml(templateHtml, templateVars);
    const resolvedReplaced = safeReplaceHtmlContent(resolved, original, replacement);
    if (resolvedReplaced !== resolved) {
      updatedTemplate = resolvedReplaced;
      changed = true;
    }
  }

  if (changed && !cleanReplacement) {
    updatedTemplate = cleanEmptyTags(updatedTemplate);
  }

  return { updatedTemplate, updatedVars, changed };
};

// ─── Email Template Types ────────────────────────────────────────────────────

export type EmailTemplateType =
  | 'refund_confirmation'
  | 'payment_confirmation'
  | 'booking_confirmation'
  | 'payment_reminder'
  | 'general';

export interface LuxuryEmailVars {
  name?: string;
  subject?: string;
  // Financial
  amount?: string;
  transaction_id?: string;
  event?: string;
  status?: string;
  payment_mode?: string;
  // Booking
  project?: string;
  plot_size?: string;
  unit_no?: string;
  booking_date?: string;
  // Links
  portal_url?: string;
  // Generic body paragraph
  body_text?: string;
  // Extra rows: key=label, value=text
  [key: string]: string | undefined;
}

const YEAR = new Date().getFullYear();

const LOGO_CAPSULE = `<div style="display:inline-block;background-color:#ffffff;padding:8px 22px;border-radius:24px;box-shadow:0 4px 14px rgba(0,0,0,0.25);margin-bottom:16px;"><img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions" width="145" height="auto" style="display:block;max-height:36px;border:0;" /></div>`;

const HELPDESK_BAR = `<tr><td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;font-size:12px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"><strong style="color:#0f172a;">Need assistance?</strong>&nbsp;&nbsp;SVI Helpdesk: <a href="tel:+917300007643" style="color:#0f172a;font-weight:700;text-decoration:none;">+91 73000-07643</a> &bull; <a href="mailto:info@sviinfrasolutions.com" style="color:#D4AF37;text-decoration:none;font-weight:600;">info@sviinfrasolutions.com</a></td></tr>`;

const LEGAL_FOOTER = `<tr><td style="background-color:#f1f5f9;padding:24px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;"><p style="margin:0 0 4px;color:#475569;font-size:12px;font-weight:700;">SVI Infra Solutions Pvt. Ltd.</p><p style="margin:0 0 8px;color:#94a3b8;font-size:11px;line-height:1.6;">Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309<br>Official Website: <a href="https://www.sviinfrasolutions.com" style="color:#64748b;text-decoration:underline;">www.sviinfrasolutions.com</a></p><p style="margin:0;color:#cbd5e1;font-size:10px;">&copy; ${YEAR} SVI Infra Solutions Pvt. Ltd. All rights reserved.</p></td></tr>`;

function headerBanner(badge: string, subtitle: string): string {
  return `<tr><td style="background:linear-gradient(135deg,#07111e 0%,#0d1e36 50%,#0a1628 100%);padding:36px 30px 28px;text-align:center;border-bottom:3px solid #D4AF37;">${LOGO_CAPSULE}<br><div style="display:inline-block;padding:5px 16px;background:rgba(212,175,55,0.15);border:1px solid #D4AF37;border-radius:20px;color:#D4AF37;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${badge}</div><p style="color:#e2e8f0;font-size:13px;margin:10px 0 0;font-weight:400;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${subtitle}</p></td></tr>`;
}

function detailTable(rows: Array<{ label: string; value: string; highlight?: boolean }>): string {
  const rowsHtml = rows
    .map(
      (r, i) =>
        `<tr style="${i % 2 === 0 ? '' : 'background-color:#ffffff;'}"><td style="padding:11px 16px;color:#64748b;font-weight:600;width:42%;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;font-size:13px;">${r.label}</td><td style="padding:11px 16px;color:${r.highlight ? '#16a34a' : '#0f172a'};font-weight:${r.highlight ? '800' : '700'};font-size:${r.highlight ? '15px' : '13px'};border-bottom:1px solid #e2e8f0;${r.label === 'Transaction ID / UTR' ? 'font-family:monospace;' : ''}">${r.value}</td></tr>`
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:22px 0;overflow:hidden;"><tr style="background-color:#f1f5f9;"><td style="padding:12px 16px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;" colspan="2">🧾 Transaction Summary</td></tr>${rowsHtml}</table>`;
}

function ctaButton(href: string, label: string): string {
  return `<div style="text-align:center;margin:28px 0 16px;"><a href="${href}" style="background:linear-gradient(135deg,#D4AF37 0%,#f3e5ab 50%,#b08f36 100%);color:#0f172a;padding:13px 36px;border-radius:30px;text-decoration:none;font-weight:800;font-size:12.5px;display:inline-block;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(212,175,55,0.35);text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${label}</a></div>`;
}

function alertBox(
  type: 'success' | 'warning' | 'info',
  title: string,
  description: string
): string {
  const styles = {
    success: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      accent: '#16a34a',
      titleColor: '#15803d',
      descColor: '#166534',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      accent: '#d97706',
      titleColor: '#92400e',
      descColor: '#78350f',
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      accent: '#2563eb',
      titleColor: '#1d4ed8',
      descColor: '#1e40af',
    },
  }[type];
  return `<div style="background-color:${styles.bg};border:1px solid ${styles.border};border-left:4px solid ${styles.accent};border-radius:8px;padding:14px 18px;margin-bottom:22px;"><p style="margin:0;color:${styles.titleColor};font-weight:700;font-size:13.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${title}</p><p style="margin:4px 0 0;color:${styles.descColor};font-size:12.5px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${description}</p></div>`;
}

/**
 * Build a complete luxury SVI corporate email HTML string from extracted variables.
 * This runs entirely server-side — no AI token budget spent on HTML generation.
 */
export function buildLuxuryEmailHtml(type: EmailTemplateType, vars: LuxuryEmailVars): string {
  const name = vars.name || 'Valued Customer';
  const portalUrl = vars.portal_url || 'https://www.sviinfrasolutions.com';

  function buildSections(): { headerHtml: string; bodyInnerHtml: string } {
    // Helper: returns clean non-placeholder value or empty string
    const v = (val: string | undefined): string => {
      if (!val) return '';
      const trimmed = val.trim();
      // Reject any angle bracket placeholders, e.g. <transaction id or UTR number>, <event or scheme name>
      if (trimmed.startsWith('<') && trimmed.endsWith('>')) return '';
      // Reject any handlebars placeholders, e.g. {{transaction_id}}, {{event}}
      if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) return '';
      // Reject bracket placeholders, e.g. [TRANSACTION ID]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) return '';
      // Reject common dummy strings
      if (/^(n\/?a|null|undefined|none|unknown|placeholder)$/i.test(trimmed)) return '';
      return trimmed;
    };

    if (type === 'refund_confirmation') {
      const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];
      if (v(vars.amount))
        rows.push({ label: 'Refund Amount', value: `₹${v(vars.amount)}`, highlight: true });
      // Transaction ID: use extracted or generate a corporate reference number so cell is never blank
      const txnId =
        v(vars.transaction_id) ||
        `SVI-REF-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      rows.push({ label: 'Transaction ID / UTR', value: txnId });
      // Event / Scheme: ONLY show if valid value was extracted (no blank placeholder row)
      if (v(vars.event)) rows.push({ label: 'Event / Scheme', value: v(vars.event) });
      // Status is always shown for confirmed refunds; default CREDITED if not extracted
      rows.push({ label: 'Status', value: v(vars.status) || 'CREDITED', highlight: true });
      if (v(vars.payment_mode)) rows.push({ label: 'Payment Mode', value: v(vars.payment_mode) });
      return {
        headerHtml: headerBanner('💳 Refund Acknowledgment', 'Official Transaction Acknowledgment'),
        bodyInnerHtml: `
          ${alertBox('success', '✓ Refund Processed Successfully', 'Your refund has been processed and will be credited to your source account within 2–4 business hours.')}
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 14px;font-weight:700;font-family:Georgia,serif;">Dear ${name},</h2>
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">We are pleased to confirm that your refund request has been processed successfully. Please review the transaction details below:</p>
          ${rows.length > 0 ? detailTable(rows) : ''}
          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">If you have any questions or do not receive the credit within the stated timeframe, please contact our helpdesk and quote your Transaction ID above.</p>
          ${ctaButton(portalUrl, 'Download Refund Receipt')}`,
      };
    }
    if (type === 'payment_confirmation') {
      const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];
      if (v(vars.amount))
        rows.push({ label: 'Amount Paid', value: `₹${v(vars.amount)}`, highlight: true });
      const txnId =
        v(vars.transaction_id) ||
        `SVI-TXN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      rows.push({ label: 'Transaction ID / UTR', value: txnId });
      if (v(vars.event)) rows.push({ label: 'Purpose / Scheme', value: v(vars.event) });
      // Status always shown; default RECEIVED for confirmed payments
      rows.push({ label: 'Status', value: v(vars.status) || 'RECEIVED', highlight: true });
      if (v(vars.payment_mode)) rows.push({ label: 'Payment Mode', value: v(vars.payment_mode) });
      return {
        headerHtml: headerBanner('✅ Payment Confirmed', 'Official Payment Receipt'),
        bodyInnerHtml: `
          ${alertBox('success', '✓ Payment Received Successfully', 'Your payment has been received and recorded in our system.')}
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 14px;font-weight:700;font-family:Georgia,serif;">Dear ${name},</h2>
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">Thank you for your payment. We have successfully received and recorded your transaction. Please retain the details below for your records:</p>
          ${rows.length > 0 ? detailTable(rows) : ''}
          ${ctaButton(portalUrl, 'View Payment Receipt')}`,
      };
    }
    if (type === 'booking_confirmation') {
      const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];
      if (v(vars.project)) rows.push({ label: 'Project', value: v(vars.project) });
      if (v(vars.unit_no)) rows.push({ label: 'Unit / Plot No.', value: v(vars.unit_no) });
      if (v(vars.plot_size)) rows.push({ label: 'Plot Size', value: v(vars.plot_size) });
      if (v(vars.amount))
        rows.push({ label: 'Booking Amount', value: `₹${v(vars.amount)}`, highlight: true });
      if (v(vars.booking_date)) rows.push({ label: 'Booking Date', value: v(vars.booking_date) });
      if (v(vars.transaction_id))
        rows.push({ label: 'Transaction ID', value: v(vars.transaction_id) });
      return {
        headerHtml: headerBanner(
          '🏡 Booking Confirmed',
          'Official Property Allotment Acknowledgment'
        ),
        bodyInnerHtml: `
          ${alertBox('success', '🎉 Booking Confirmed!', 'Your property booking with SVI Infra Solutions has been confirmed successfully.')}
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 14px;font-weight:700;font-family:Georgia,serif;">Dear ${name},</h2>
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">We are delighted to confirm your booking with SVI Infra Solutions. Your investment journey begins today. Here are your booking details:</p>
          ${rows.length > 0 ? detailTable(rows) : ''}
          ${ctaButton(portalUrl, 'View Booking Details')}`,
      };
    }
    if (type === 'payment_reminder') {
      const rows: Array<{ label: string; value: string; highlight?: boolean }> = [];
      if (v(vars.amount))
        rows.push({ label: 'Amount Due', value: `₹${v(vars.amount)}`, highlight: true });
      if (v(vars.event)) rows.push({ label: 'Purpose / Scheme', value: v(vars.event) });
      if (v(vars.transaction_id))
        rows.push({ label: 'Reference ID', value: v(vars.transaction_id) });
      return {
        headerHtml: headerBanner('⏰ Payment Reminder', 'Action Required — Pending Payment'),
        bodyInnerHtml: `
          ${alertBox('warning', '⚠ Payment Due — Action Required', 'Please complete your payment at the earliest to avoid any delays or service interruptions.')}
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 14px;font-weight:700;font-family:Georgia,serif;">Dear ${name},</h2>
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">This is a friendly reminder regarding a pending payment in your account. Kindly review the details below and complete the payment at your earliest convenience:</p>
          ${rows.length > 0 ? detailTable(rows) : ''}
          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">If you believe this is an error or have already made the payment, please contact our helpdesk immediately.</p>
          ${ctaButton(portalUrl, 'Pay Now')}`,
      };
    }
    // general
    return {
      headerHtml: headerBanner(
        '📋 Official Communication',
        'SVI Infra Solutions — Corporate Notice'
      ),
      bodyInnerHtml: `
        <h2 style="color:#0f172a;font-size:18px;margin:0 0 14px;font-weight:700;font-family:Georgia,serif;">Dear ${name},</h2>
        <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">${vars.body_text || 'Please find the details of your communication below.'}</p>
        ${ctaButton(portalUrl, 'Visit Portal')}`,
    };
  }

  const { headerHtml, bodyInnerHtml } = buildSections();

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${vars.subject || 'SVI Infra Solutions'}</title></head><body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f1f5f9;padding:32px 10px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">${headerHtml}<tr><td style="padding:34px 30px 28px;background-color:#ffffff;">${bodyInnerHtml}</td></tr>${HELPDESK_BAR}${LEGAL_FOOTER}</table></td></tr></table></body></html>`;
}
