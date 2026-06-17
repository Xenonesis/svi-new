import { PROPERTY_LABELS } from './propertyLabels';

/**
 * Returns the list of properties to display in a form.
 * Falls back to PROPERTY_LABELS if no dynamic properties are provided.
 */
export function getDisplayProperties(
  properties: Array<{ name: string; slug: string }>
): Array<{ name: string; slug: string }> {
  return properties.length > 0
    ? properties
    : Object.entries(PROPERTY_LABELS).map(([slug, name]) => ({ name, slug }));
}

/**
 * Toggles a property slug in a comma-separated interest string.
 * e.g. togglePropertySelection('a,b', 'b') => 'a'
 *      togglePropertySelection('a,b', 'c') => 'a,b,c'
 */
export function togglePropertySelection(current: string, slug: string): string {
  const selected = current ? current.split(',') : [];
  const updated = selected.includes(slug)
    ? selected.filter((s) => s !== slug)
    : [...selected, slug];
  return updated.join(',');
}
