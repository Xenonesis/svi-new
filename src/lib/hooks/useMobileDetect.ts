'use client';

/**
 * useMobileDetect — Singleton mobile detection hook.
 *
 * Instead of each AnimatedSection/StaggerContainer registering its own
 * window.resize listener, this module maintains ONE shared listener and
 * broadcasts state updates to all subscribers. This reduces the number
 * of resize listeners from O(n sections) down to exactly 1.
 */

type Subscriber = (mobile: boolean) => void;

let currentIsMobile = false;
const subscribers = new Set<Subscriber>();
let listenerRegistered = false;

function notifyAll() {
  subscribers.forEach((fn) => fn(currentIsMobile));
}

function ensureListener() {
  if (listenerRegistered || typeof window === 'undefined') return;
  listenerRegistered = true;
  currentIsMobile = window.innerWidth < 768;

  const handleResize = () => {
    const next = window.innerWidth < 768;
    if (next !== currentIsMobile) {
      currentIsMobile = next;
      notifyAll();
    }
  };

  window.addEventListener('resize', handleResize, { passive: true });
}

import { useState, useEffect } from 'react';

export function useMobileDetect(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    ensureListener();
    // Sync to current value immediately on mount
    setIsMobile(currentIsMobile);

    subscribers.add(setIsMobile);
    return () => {
      subscribers.delete(setIsMobile);
    };
  }, []);

  return isMobile;
}
