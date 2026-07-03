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
  scale = 3,
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

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
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

      // If the section between pageStart and nextBreak is larger than a page,
      // we MUST slice it strictly at pxPerPage intervals to avoid clipping content.
      while (nextBreak - pageStart > pxPerPage) {
        slices.push({ start: pageStart, end: pageStart + pxPerPage });
        pageStart += pxPerPage;
      }

      // Now the remaining part fits in one page. We MUST flush it here because
      // nextBreak is an EXPLICIT page break requested by the DOM.
      if (nextBreak > pageStart) {
        slices.push({ start: pageStart, end: nextBreak });
        pageStart = nextBreak;
      }
    }

    // ── Render slices into PDF ────────────────────────────────────────────────
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    let pagesAdded = 0;

    slices.forEach((slice) => {
      const sliceH = slice.end - slice.start;
      if (sliceH <= 0) return;

      // Check if this slice is completely blank/white
      const tmpCheck = document.createElement('canvas');
      tmpCheck.width = canvasW;
      tmpCheck.height = sliceH;
      const ctxCheck = tmpCheck.getContext('2d');
      if (ctxCheck) {
        ctxCheck.drawImage(canvas, 0, slice.start, canvasW, sliceH, 0, 0, canvasW, sliceH);
        const data = ctxCheck.getImageData(0, 0, canvasW, sliceH).data;
        let isBlank = true;
        for (let i = 0; i < data.length; i += 800) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a > 0 && (r < 245 || g < 245 || b < 245)) {
            isBlank = false;
            break;
          }
        }
        if (isBlank) return; // Skip empty slice!
      }

      if (pagesAdded > 0) pdf.addPage();

      const tmp = document.createElement('canvas');
      tmp.width = canvasW;
      tmp.height = pxPerPage; // always full A4 height (white fills remainder)
      const ctx = tmp.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, pxPerPage);
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
  scale = 3,
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
      imageTimeout: 15000,
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
