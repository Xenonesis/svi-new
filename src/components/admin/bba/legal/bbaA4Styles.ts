import React from 'react';

/**
 * Standard ISO 216 A4 Paper dimensions at 96 DPI:
 * 210mm x 297mm => 793.7px x 1122.5px => rounded to 794px x 1123px.
 * Aspect ratio: 1 : 1.4142.
 */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1122;

/** Standard A4 paper style for inner BBA pages (page 2 to 16) */
export const BBA_A4_PAGE_STYLE: React.CSSProperties = {
  width: `${A4_WIDTH_PX}px`,
  minHeight: `${A4_HEIGHT_PX}px`,
  boxSizing: 'border-box',
  padding: '32px 36px 28px 36px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  pageBreakBefore: 'always',
  marginBottom: '2rem',
};

/** Standard A4 paper style for the BBA Cover page (page 1) */
export const BBA_A4_COVER_STYLE: React.CSSProperties = {
  width: `${A4_WIDTH_PX}px`,
  minHeight: `${A4_HEIGHT_PX}px`,
  boxSizing: 'border-box',
  padding: '32px 36px 28px 36px',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  marginBottom: '2rem',
};

/** Class string for an individual A4 paper sheet in the preview */
export const BBA_A4_PAGE_CLASS =
  'bba-page bba-a4-page pdf-page relative mx-auto flex flex-col justify-between rounded-xs bg-white text-left font-sans shadow-md ring-1 ring-black/5 print:m-0 print:shadow-none print:ring-0';
