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
 * Safe targeted text replacement inside HTML content.
 * Replaces only the text matching `original`, preserving all parent table/card structures.
 */
export const safeReplaceHtmlContent = (
  sourceHtml: string,
  original: string,
  replacement: string
): string => {
  if (!sourceHtml || !original.trim()) return sourceHtml;

  // 1. Direct exact match
  if (sourceHtml.includes(original)) {
    return sourceHtml.replace(original, replacement);
  }

  // 2. Exact trimmed match
  if (sourceHtml.includes(original.trim())) {
    return sourceHtml.replace(original.trim(), replacement);
  }

  // 3. Multi-word flexible regex match (handles newlines, whitespace differences, and embedded inline tags)
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const words = original.trim().split(/\s+/).filter(Boolean).map(escapeRegex);

  if (words.length > 0) {
    const flexibleRegex = new RegExp(words.join('(?:\\s+|&nbsp;|<[^>]+>)*'), 'i');
    if (flexibleRegex.test(sourceHtml)) {
      return sourceHtml.replace(flexibleRegex, replacement);
    }
  }

  return sourceHtml;
};
