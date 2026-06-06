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

  // 2. Process standard variables
  Object.entries(templateVars).forEach(([key, value]) => {
    const pattern = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
    result = result.replace(
      pattern,
      value !== undefined && value !== null ? value : '{{' + key + '}}'
    );
  });

  return result;
};
