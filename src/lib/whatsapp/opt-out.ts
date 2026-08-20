const OPT_OUT_PATTERNS = [
  /\b(stop|unsubscribe|opt\s*out|cancel)\b/i,
  /\b(do\s*not|don't|dont)\s+(message|text|contact|whatsapp)\b/i,
  /\b(message|msg|whatsapp|contact)\s+(mat|nahi|nahin)\s+(karo|karna)?\b/i,
  /\b(band|bnd)\s*(karo|kar\s*do)?\b/i,
  /(मैसेज|मेसेज|संदेश|व्हाट्सऐप|व्हाट्सएप).*(मत|बंद)/u,
  /(बंद|रोक).*(करो|करें|कर दो)/u,
  /नहीं\s*चाहिए/u,
];

export function isOptOutMessage(text: string): boolean {
  const normalized = text.normalize('NFKC').trim().replace(/\s+/g, ' ');
  return normalized.length <= 160 && OPT_OUT_PATTERNS.some((pattern) => pattern.test(normalized));
}
