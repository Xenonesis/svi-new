"use client";

import { memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = memo(function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
});

export default ScrollToTop;
