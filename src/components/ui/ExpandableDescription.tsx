'use client';

import { useState } from 'react';

export default function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If text is short, don't show toggle
  if (text.length <= 150) {
    return <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>;
  }

  return (
    <div>
      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
        {isExpanded ? text : `${text.slice(0, 150)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-brand-gold ml-2 font-semibold hover:underline focus:outline-none"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </p>
    </div>
  );
}
