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
  width = '1024px',
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
      windowWidth: 1024,
      windowHeight: clone.scrollHeight,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // mm-per-canvas-pixel ratio (keeping full width)
    const scaleRatio = pdfWidth / canvasWidth;
    const imgHeightMM = canvasHeight * scaleRatio;

    const imgData = canvas.toDataURL('image/png', 1.0);

    let heightLeft = imgHeightMM;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMM; // This shifts the image up for the next page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
      heightLeft -= pdfHeight;
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
  width = '1024px',
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
      windowWidth: 1024,
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
