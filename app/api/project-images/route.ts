import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const shivaniDir = fs.existsSync(path.join(publicDir, 'Shivani Vatika 11'))
      ? path.join(publicDir, 'Shivani Vatika 11')
      : path.join(publicDir, 'Shivani Vatika');
    const shivaniPrefix = fs.existsSync(path.join(publicDir, 'Shivani Vatika 11'))
      ? 'Shivani Vatika 11'
      : 'Shivani Vatika';
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

      const orderPriority: Record<string, number> = {
        gate: 1,
        plot: 2,
        middle: 3,
        middle2: 4,
        middle3: 5,
        middle4: 6,
        middle5: 7,
        middle6: 8,
      };

      const sortedFiles = Array.from(fileMap.entries())
        .sort(([baseA], [baseB]) => {
          const pA = orderPriority[baseA.toLowerCase()] ?? 99;
          const pB = orderPriority[baseB.toLowerCase()] ?? 99;
          if (pA !== pB) return pA - pB;
          return baseA.localeCompare(baseB);
        })
        .map(([, file]) => file);

      return sortedFiles.map((file) => encodeURI(`/${urlPrefix}/${file}`));
    };

    const shivaniImages = getCleanImageList(shivaniDir, shivaniPrefix);
    const shyamImages = getCleanImageList(shyamDir, 'Shayam angan');

    return NextResponse.json(
      {
        'shivani-vatika': shivaniImages,
        'shivani-vatika-11': shivaniImages,
        'shivani-vatika-11th': shivaniImages,
        'shyam-aangan': shyamImages,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
