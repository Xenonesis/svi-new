interface ExportOptions {
  elementId: string;
  filename: string;
  padding?: string;
  scale?: number;
  width?: string;
}

/** Build a clone, style it for off-screen rendering and return it appended to body. */
function buildClone(element: HTMLElement, width: string, padding: string): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.backgroundColor = 'white';
  clone.style.color = 'black';
  clone.style.width = width;
  clone.style.maxWidth = 'none';
  clone.style.minHeight = element.offsetHeight + 'px';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.padding = padding;
  clone.style.boxSizing = 'border-box';
  document.body.appendChild(clone);
  return clone;
}

/** Wait for all <img> elements inside an element to load. */
function waitForImages(el: HTMLElement): Promise<void[]> {
  const imgs = Array.from(el.querySelectorAll('img'));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );
}

export async function exportToPDF({
  elementId,
  filename,
  padding = '32px',
  scale = 2,
  width = '1200px',
}: ExportOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  const html2canvas = (await import('html2canvas-pro')).default;
  const { default: jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found.`);

  const clone = buildClone(element, width, padding);

  try {
    await waitForImages(clone);
    // Let the browser finish layout
    await new Promise((r) => setTimeout(r, 200));

    // ── Check if document specifies discrete pages ─────────────────────────
    const discretePages = Array.from(
      clone.querySelectorAll<HTMLElement>('[data-pdf-page="true"], .pdf-page, .offer-letter-page')
    );

    if (discretePages.length > 0) {
      clone.style.padding = '0';
      clone.style.width = 'auto';
      const A4_W_MM = 210;
      const A4_H_MM = 297;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

      for (let i = 0; i < discretePages.length; i++) {
        const pageEl = discretePages[i];
        if (i > 0) pdf.addPage();

        const prevShadow = pageEl.style.boxShadow;
        const prevBorder = pageEl.style.border;
        const prevMargin = pageEl.style.margin;
        pageEl.style.boxShadow = 'none';
        pageEl.style.border = 'none';
        pageEl.style.margin = '0';

        const pageCanvas = await html2canvas(pageEl, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 2000,
          scrollX: 0,
          scrollY: 0,
        });

        pageEl.style.boxShadow = prevShadow;
        pageEl.style.border = prevBorder;
        pageEl.style.margin = prevMargin;

        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          0,
          0,
          A4_W_MM,
          A4_H_MM,
          undefined,
          'FAST'
        );
      }

      const out = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(out);
      return;
    }
    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 2000,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: parseInt(width) || 1200,
      windowHeight: clone.scrollHeight,
    });

    const A4_W_MM = 210;
    const A4_H_MM = 297;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // Height (in canvas px) that corresponds to one A4 page
    const pxPerPage = Math.floor(canvasW * (A4_H_MM / A4_W_MM));

    // ── Collect page-break Y positions from styled elements ─────────────────
    const cloneRect = clone.getBoundingClientRect();
    const breakEls = clone.querySelectorAll<HTMLElement>(
      '[style*="page-break-before"],[style*="pageBreakBefore"],[style*="break-before"]'
    );

    const breakYs = new Set<number>();
    breakYs.add(0);
    breakEls.forEach((el) => {
      const relY = el.getBoundingClientRect().top - cloneRect.top;
      const canvasY = Math.floor(relY * scale);
      if (canvasY > 0 && canvasY < canvasH) breakYs.add(canvasY);
    });
    breakYs.add(canvasH); // sentinel

    const sortedBreaks = Array.from(breakYs).sort((a, b) => a - b);

    // ── Group break sections into A4-sized pages ─────────────────────────────
    const slices: { start: number; end: number }[] = [];
    let pageStart = 0;

    for (let i = 1; i < sortedBreaks.length; i++) {
      const nextBreak = sortedBreaks[i];

      // If the section fits within 1 page (or slight ~12% tolerance before an explicit DOM page break),
      // keep it as one page slice to avoid producing an accidental near-empty blank page.
      if (nextBreak - pageStart <= pxPerPage * 1.12) {
        if (nextBreak > pageStart) {
          slices.push({ start: pageStart, end: nextBreak });
          pageStart = nextBreak;
        }
        continue;
      }

      // If the section is significantly larger than a page, slice at pxPerPage intervals
      while (nextBreak - pageStart > pxPerPage) {
        // If what remains before nextBreak is a tiny sliver (< 12% of a page),
        // let the final slice capture it instead of splitting into a 50px tail on an empty page.
        if (nextBreak - pageStart <= pxPerPage * 1.12) {
          break;
        }
        slices.push({ start: pageStart, end: pageStart + pxPerPage });
        pageStart += pxPerPage;
      }

      // Flush remainder
      if (nextBreak > pageStart) {
        const sliceH = nextBreak - pageStart;
        // Ignore negligible residual whitespace sliver (< 60px) right at a page break
        if (sliceH > 60 || slices.length === 0) {
          slices.push({ start: pageStart, end: nextBreak });
        }
        pageStart = nextBreak;
      }
    }

    // ── Render slices into PDF ────────────────────────────────────────────────
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    let pagesAdded = 0;

    slices.forEach((slice) => {
      const sliceH = slice.end - slice.start;
      if (sliceH <= 0) return;

      // Check if this slice is completely blank / faint watermark only
      const tmpCheck = document.createElement('canvas');
      tmpCheck.width = canvasW;
      tmpCheck.height = sliceH;
      const ctxCheck = tmpCheck.getContext('2d');
      if (ctxCheck) {
        ctxCheck.drawImage(canvas, 0, slice.start, canvasW, sliceH, 0, 0, canvasW, sliceH);
        const data = ctxCheck.getImageData(0, 0, canvasW, sliceH).data;
        let darkPixelCount = 0;
        // Sample every 2000 bytes (500 pixels) for fast & reliable text detection
        for (let i = 0; i < data.length; i += 2000) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          // Real text/borders have distinct dark contrast (r/g/b < 210).
          // Watermark/blank background is near-white (r/g/b > 240).
          if (a > 0 && (r < 210 || g < 210 || b < 210)) {
            darkPixelCount++;
            if (darkPixelCount > 8) break;
          }
        }
        // If slice contains almost no visible text/borders, skip it to avoid blank page
        if (darkPixelCount <= 8) return;
      }

      if (pagesAdded > 0) pdf.addPage();

      const tmp = document.createElement('canvas');
      tmp.width = canvasW;
      const renderH = Math.max(pxPerPage, sliceH);
      tmp.height = renderH;
      const ctx = tmp.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, renderH);
        ctx.drawImage(canvas, 0, slice.start, canvasW, sliceH, 0, 0, canvasW, sliceH);
      }

      pdf.addImage(
        tmp.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        0,
        A4_W_MM,
        A4_H_MM,
        undefined,
        'FAST'
      );

      pagesAdded++;
    });

    const out = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(out);
  } finally {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
  }
}

export async function exportToImage({
  elementId,
  filename,
  padding = '32px',
  scale = 2,
  width = '1200px',
}: ExportOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  const html2canvas = (await import('html2canvas-pro')).default;

  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found.`);

  const clone = buildClone(element, width, padding);

  try {
    await waitForImages(clone);

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 2000,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: parseInt(width) || 1200,
      windowHeight: clone.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const out = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`;
    link.download = out;
    link.href = imgData;
    link.click();
  } finally {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
  }
}
