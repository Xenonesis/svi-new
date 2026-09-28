'use client';

import type { MouseEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const WhatsAppBrochureModal = dynamic(
  () => import('@/src/components/common/WhatsAppBrochureModal'),
  { ssr: false }
);

interface BlogInteractiveContentProps {
  content: string;
  projectName?: string;
  pdfUrl?: string;
}

export default function BlogInteractiveContent({
  content,
  projectName = 'Shivani Vatika 11th',
  pdfUrl = '/Shivani Vatika 11/master-plan-layout.pdf',
}: BlogInteractiveContentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check if user already submitted lead/enquiry during session
  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(
          `layout_unlocked_${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
        )
      ) {
        setIsUnlocked(true);
      }
    } catch {
      // ignore storage access issues
    }
  }, [projectName]);

  // Intercept click on any unlock / gated layout button inside the rendered HTML
  const handleContentClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-unlock-blueprint="true"]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      setModalOpen(true);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <div
        className={`blog-content max-w-none ${isUnlocked ? 'blueprint-unlocked' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={handleContentClick}
      />

      <WhatsAppBrochureModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        projectName={projectName}
        defaultBrochureUrl={pdfUrl}
      />
    </>
  );
}
