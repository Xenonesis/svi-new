import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

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
  width = '210mm',
}: ExportOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  // Clone the element to avoid modifying the original view
  const clone = element.cloneNode(true) as HTMLElement;

  // Set proper styles for high-quality print layout
  clone.style.backgroundColor = 'white';
  clone.style.color = 'black';
  clone.style.width = width;
  clone.style.minHeight = element.offsetHeight + 'px';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.padding = padding;
  clone.style.boxSizing = 'border-box';

  // Wait for all images in the clone to load
  const images = clone.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
      }
    });
  });

  document.body.appendChild(clone);

  try {
    // Wait for images to load
    await Promise.all(imagePromises);

    // Use high-quality settings for perfect capture
    const canvas = await html2canvas(clone, {
      scale: scale, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794, // A4 width in pixels at 96 DPI (210mm)
      windowHeight: clone.scrollHeight,
    });

    // Create PDF with exact A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    // Use PNG for maximum quality
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    // Ensure filename ends with .pdf
    const outputFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(outputFilename);
  } finally {
    // Clean up cloned element from DOM
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
  width = '210mm',
}: ExportOptions): Promise<void> {
  if (typeof window === 'undefined') return;

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
      windowWidth: 794,
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
