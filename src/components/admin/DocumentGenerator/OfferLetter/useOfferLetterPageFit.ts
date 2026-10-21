'use client';

import { RefObject, useLayoutEffect } from 'react';
import { SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';
import { CompanyInfo, OfferLetterFormData } from './types';

export const OFFER_PAGE_WIDTH = 794;
export const OFFER_PAGE_HEIGHT = 1123;
export const OFFER_PADDING_X = 36;
export const OFFER_PADDING_TOP = 24;
export const OFFER_PADDING_BOTTOM = 20;
export const OFFER_CONTENT_WIDTH = OFFER_PAGE_WIDTH - OFFER_PADDING_X * 2; // 722
export const OFFER_CONTENT_HEIGHT = OFFER_PAGE_HEIGHT - OFFER_PADDING_TOP - OFFER_PADDING_BOTTOM; // 1079

interface PageFitMetrics {
  group: HTMLElement;
  content: HTMLElement;
  footer: HTMLElement | null;
}

/**
 * Automatically fits each page's content so no page ever overflows the A4 box.
 * Computes a single uniform scale across all 3 pages so typography remains
 * consistent throughout the document.
 */
export function useOfferLetterPageFit(
  containerRef: RefObject<HTMLElement | null>,
  formData: OfferLetterFormData,
  companyInfo: CompanyInfo,
  matchedSlab: SalarySlabType | null | undefined,
  language: 'en' | 'hi'
): void {
  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const pages = Array.from(root.querySelectorAll<HTMLElement>('[data-pdf-page="true"]'));
    if (pages.length === 0) return;

    const metrics: PageFitMetrics[] = [];
    for (const page of pages) {
      const group = page.querySelector<HTMLElement>('[data-page-fit-group="true"]');
      const content = page.querySelector<HTMLElement>('[data-page-content="true"]');
      if (!group || !content) continue;
      metrics.push({
        group,
        content,
        footer: page.querySelector<HTMLElement>('[data-page-footer="true"]'),
      });
    }
    if (metrics.length === 0) return;

    // 1. Measure at unscaled natural layout width so reading is independent of previous scale.
    metrics.forEach(({ group }) => {
      group.style.width = `${OFFER_CONTENT_WIDTH}px`;
      group.style.height = 'auto';
      group.style.transform = 'none';
    });
    void root.offsetHeight; // flush layout

    // 2. Find uniform scale so every page fits without clipping.
    let scale = 1;
    for (const { content, footer } of metrics) {
      const footerH = footer ? footer.getBoundingClientRect().height : 0;
      const available = OFFER_CONTENT_HEIGHT - footerH;
      const natural = content.scrollHeight;
      if (natural > available && natural > 0) {
        scale = Math.min(scale, available / natural);
      }
    }

    // Safety floor — prevents pathological micro-text.
    scale = Math.max(scale, 0.65);

    // 3. Apply uniform scale + width/height compensation.
    metrics.forEach(({ group }) => {
      group.style.width = `${OFFER_CONTENT_WIDTH / scale}px`;
      group.style.height = `${OFFER_CONTENT_HEIGHT / scale}px`;
      group.style.transform = `scale(${scale})`;
      group.style.transformOrigin = 'top left';
    });
  }, [containerRef, formData, companyInfo, matchedSlab, language]);
}
