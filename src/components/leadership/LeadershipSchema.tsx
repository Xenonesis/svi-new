import React from 'react';

export interface LeadershipMember {
  name: string;
  role: string;
  bio?: string;
}

export function LeadershipSchema({
  directors,
}: {
  directors: LeadershipMember[];
}): React.JSX.Element {
  const personSchema = {
    '@context': 'https://schema.org',
    '@graph': directors.map((member) => ({
      '@type': 'Person',
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
      worksFor: {
        '@type': 'Organization',
        name: 'SVI Infra Solutions Private Limited',
        url: 'https://www.sviinfrasolutions.com',
      },
      url: 'https://www.sviinfrasolutions.com/leadership',
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  );
}
