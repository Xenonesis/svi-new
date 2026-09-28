import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/login',
          '/en/login',
          '/hi/login',
          '/employee',
          '/payment',
          '/thank-you',
          '/*?type=',
          '/*?status=',
          '/*?search=',
        ],
      },

      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Bingbot',
        ],
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/login',
          '/en/login',
          '/hi/login',
          '/employee',
          '/payment',
          '/thank-you',
          '/*?type=',
          '/*?status=',
          '/*?search=',
        ],
      },
    ],
    sitemap: 'https://www.sviinfrasolutions.com/sitemap.xml',
  };
}
