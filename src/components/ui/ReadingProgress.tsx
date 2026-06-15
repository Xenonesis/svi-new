'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(Number((window.scrollY / scrollHeight).toFixed(2)) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[9999] h-[3px] w-full bg-transparent">
      <div
        className="from-brand-gold to-brand-gold shadow-[0_1px_10px_rgba(212, 175, 55,0.5)] h-full bg-gradient-to-r via-[#f0d080] transition-all duration-75 ease-out"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
