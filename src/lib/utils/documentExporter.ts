interface ExportOptions {
  elementId: string;
  filename: string;
  padding?: string;
  scale?: number;
  width?: string;
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
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

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

  const images = clone.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  });

  document.body.appendChild(clone);

  try {
    await Promise.all(imagePromises);

    const canvas = await html2canvas(clone, {
      scale: scale,
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

    const pdfWidth = 210; // 210 mm (A4 width)
    const pdfHeight = 297; // 297 mm (A4 height)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Pixel height of one A4 page on the high-res canvas
    const pxPageHeight = Math.floor(canvasWidth * (pdfHeight / pdfWidth));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let yOffset = 0;
    let pageNum = 1;

    while (yOffset < canvasHeight) {
      if (pageNum > 1) {
        pdf.addPage();
      }

      const remainingHeight = canvasHeight - yOffset;
      const sHeight = Math.min(pxPageHeight, remainingHeight);

      // Create a temporary canvas for this slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = pxPageHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        // Fill white background to avoid black borders if content is shorter than page height
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, canvasWidth, pxPageHeight);

        // Draw the sliced section from the main canvas
        tempCtx.drawImage(canvas, 0, yOffset, canvasWidth, sHeight, 0, 0, canvasWidth, sHeight);
      }

      const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      yOffset += pxPageHeight;
      pageNum++;
    }

    const outputFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(outputFilename);
  } finally {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
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
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

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

  const images = clone.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  });

  document.body.appendChild(clone);

  try {
    await Promise.all(imagePromises);

    const canvas = await html2canvas(clone, {
      scale: scale,
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

    // Ensure filename ends with .png
    const outputFilename = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`;
    link.download = outputFilename;
    link.href = imgData;
    link.click();
  } finally {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}
