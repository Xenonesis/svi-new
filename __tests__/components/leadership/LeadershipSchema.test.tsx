import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  LeadershipSchema,
  type LeadershipMember,
} from '@/src/components/leadership/LeadershipSchema';

describe('LeadershipSchema component', () => {
  it('renders application/ld+json script with valid Person schema graph', () => {
    const mockDirectors: LeadershipMember[] = [
      {
        name: 'Iliyas Ali',
        role: 'Director',
        bio: 'Key personnel behind SVI Infra Solutions Private Limited.',
      },
      {
        name: 'Vinod Kumar',
        role: 'Director',
        bio: 'Brings extensive expertise in building construction.',
      },
    ];

    const { container } = render(<LeadershipSchema directors={mockDirectors} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    expect(script?.textContent).toBeDefined();

    const parsed = JSON.parse(script!.textContent || '{}');
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(2);

    expect(parsed['@graph'][0]).toEqual({
      '@type': 'Person',
      name: 'Iliyas Ali',
      jobTitle: 'Director',
      description: 'Key personnel behind SVI Infra Solutions Private Limited.',
      worksFor: {
        '@type': 'Organization',
        name: 'SVI Infra Solutions Private Limited',
        url: 'https://www.sviinfrasolutions.com',
      },
      url: 'https://www.sviinfrasolutions.com/leadership',
    });

    expect(parsed['@graph'][1]).toEqual({
      '@type': 'Person',
      name: 'Vinod Kumar',
      jobTitle: 'Director',
      description: 'Brings extensive expertise in building construction.',
      worksFor: {
        '@type': 'Organization',
        name: 'SVI Infra Solutions Private Limited',
        url: 'https://www.sviinfrasolutions.com',
      },
      url: 'https://www.sviinfrasolutions.com/leadership',
    });
  });

  it('renders an empty graph when directors list is empty', () => {
    const { container } = render(<LeadershipSchema directors={[]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script!.textContent || '{}');
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toEqual([]);
  });
});
