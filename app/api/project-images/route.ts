import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const shivaniDir = path.join(publicDir, 'Shivani Vatika');
    const shyamDir = path.join(publicDir, 'Shayam angan');

    const imageRegex = /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i;
    // Exclude responsive suffix variants like -640w.webp or .avif from direct gallery listing
    const isBaseImage = (file: string) =>
      !/-\d+w\.(webp|avif)$/i.test(file) && !/\.avif$/i.test(file);

    const getCleanImageList = (dir: string, urlPrefix: string): string[] => {
      if (!fs.existsSync(dir)) return [];
      const allFiles = fs
        .readdirSync(dir)
        .filter((file) => imageRegex.test(file) && isBaseImage(file));

      // If a .webp version of a file exists, prefer it over .jpg/.png
      const fileMap = new Map<string, string>();
      for (const file of allFiles) {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        if (!fileMap.has(baseName) || ext.toLowerCase() === '.webp') {
          fileMap.set(baseName, file);
        }
      }

      return Array.from(fileMap.values()).map(
        (file) => `/${urlPrefix}/${encodeURIComponent(file)}`
      );
    };

    const shivaniImages = getCleanImageList(shivaniDir, 'Shivani Vatika');
    const shyamImages = getCleanImageList(shyamDir, 'Shayam angan');

    return NextResponse.json({
      'shivani-vatika': shivaniImages,
      'shyam-aangan': shyamImages,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
