'use client';

/**
 * Compress an image file to fit under maxSize bytes.
 * Uses Canvas API — quality reduction first, then dimension scaling as fallback.
 * Only handles image/* MIME types. Returns original file for non-images (PDF).
 */
export async function compressImage(file: File, maxSize: number): Promise<File> {
  // Non-image or already small enough — return as-is
  if (!file.type.startsWith('image/') || file.size <= maxSize) return file;

  const originalName = file.name;
  const ext = originalName.split('.').pop() || 'jpg';

  // Map to output type
  let outputType: string;
  switch (file.type) {
    case 'image/jpeg':
    case 'image/jpg':
      outputType = 'image/jpeg';
      break;
    case 'image/png':
      outputType = 'image/png';
      break;
    case 'image/webp':
      outputType = 'image/webp';
      break;
    default:
      outputType = 'image/jpeg'; // fallback
  }

  // Load into Image element
  const img = await loadImage(file);

  // Try quality reduction first (JPEG / WEBP support quality param)
  const quality = 0.8;
  const qualitySteps = [0.8, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  let bestBlob: Blob | null = null;

  for (const q of qualitySteps) {
    bestBlob = await canvasToBlob(img, img.width, img.height, outputType, q);
    if (bestBlob && bestBlob.size <= maxSize) {
      return blobToFile(bestBlob, originalName, outputType);
    }
  }

  // Still too large — scale down dimensions iteratively
  let width = img.width;
  let height = img.height;
  const scaleFactor = 0.9;

  while (bestBlob && bestBlob.size > maxSize && width > 100 && height > 100) {
    width = Math.round(width * scaleFactor);
    height = Math.round(height * scaleFactor);
    bestBlob = await canvasToBlob(img, width, height, outputType, 0.7);
  }

  if (bestBlob && bestBlob.size <= maxSize) {
    return blobToFile(bestBlob, originalName, outputType);
  }

  // Last resort — lowest quality at smallest dimension
  const finalBlob = await canvasToBlob(
    img,
    Math.max(width, 100),
    Math.max(height, 100),
    outputType,
    0.1
  );
  if (finalBlob) {
    return blobToFile(finalBlob, originalName, outputType);
  }

  // Give up — return original
  return file;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type });
}
