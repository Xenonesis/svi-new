import type { BlogPost } from '@/src/lib/blog';
import { absoluteUrl, localizedUrl } from '@/src/lib/seo';
import { PROJECT_FAQS } from '@/src/data/faq/general';
import { PROJECT_FAQS_HI } from '@/src/data/faq/hi';

export interface BlogPostJsonLdProps {
  post: BlogPost;
  locale: string;
  slug: string;
}

export function BlogPostJsonLd({ post, locale, slug }: BlogPostJsonLdProps) {
  const isHindi = locale === 'hi';
  const title = isHindi && post.titleHi ? post.titleHi : post.title;
  const excerpt = isHindi && post.excerptHi ? post.excerptHi : post.excerpt;
  const tags = isHindi && post.tagsHi ? post.tagsHi : post.tags;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    image: [absoluteUrl(post.image)],
    inLanguage: isHindi ? 'hi' : 'en',
    keywords: tags ? tags.join(', ') : '',
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: 'Real Estate Research & Investment Analyst',
      worksFor: {
        '@type': 'Organization',
        name: 'SVI Infra Solutions Pvt. Ltd.',
        url: 'https://svi-infra.com',
      },
      description: isHindi
        ? 'जयपुर, नोएडा और DMIC कॉरिडोर में 17+ वर्षों का रियल एस्टेट और टाउनशिप डेवलपमेंट अनुभव।'
        : 'Real estate advisory and township development expert with 17+ years of experience across Jaipur, Noida, and DMIC corridors.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SVI Infra Solutions Pvt. Ltd.',
      url: 'https://svi-infra.com',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo-app-badge.png'),
      },
      sameAs: ['https://svi-infra.com', 'https://wa.me/917300007643'],
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': localizedUrl(`/blog/${slug}`, locale),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isHindi ? 'होम' : 'Home',
        item: localizedUrl('/', locale),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isHindi ? 'ब्लॉग' : 'Blog',
        item: localizedUrl('/blog', locale),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: localizedUrl(`/blog/${slug}`, locale),
      },
    ],
  };

  const faqs = isHindi ? PROJECT_FAQS_HI : PROJECT_FAQS;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

export default BlogPostJsonLd;
