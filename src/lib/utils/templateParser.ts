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
 * Replace variables and evaluate conditional blocks (e.g. {{#key}}...{{/key}})
 * in an HTML template string based on provided template variables.
 */
export const getPreviewHtml = (
  sourceHtml: string | null,
  templateVars: Record<string, string>
): string => {
  if (!sourceHtml) return '';
  let result = sourceHtml;

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
