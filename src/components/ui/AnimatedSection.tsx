'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Variants, motion } from 'motion/react';

type AnimationType = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scale' | 'stagger';

const VARIANTS: Record<AnimationType, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};

interface AnimatedSectionProps {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

export default function AnimatedSection({
  children,
  type = 'fadeUp',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
}: AnimatedSectionProps) {
  // On mobile (small viewports), use no negative margin so whileInView
  // triggers as soon as the element enters the viewport at all.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '150px', amount: 0 }}
      variants={VARIANTS[type]}
      transition={{
        duration: Math.min(duration, 0.4),
        delay: isMobile ? Math.min(delay, 0.05) : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
  delayChildren = 0.05,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '150px', amount: 0 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: isMobile ? Math.min(staggerDelay, 0.05) : staggerDelay,
            delayChildren: isMobile ? 0 : delayChildren,
          },
        },
      }}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  type = 'fadeUp',
}: {
  children: ReactNode;
  className?: string;
  type?: AnimationType;
}) {
  return (
    <motion.div
      variants={VARIANTS[type]}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </motion.div>
  );
}
