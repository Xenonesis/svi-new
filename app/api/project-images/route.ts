import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { handleApiError } from '@/src/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const shivani11Dir = path.join(publicDir, 'Shivani Vatika 11');
    const shivaniVatikaDir = path.join(publicDir, 'Shivani Vatika');
    const shyamDir = path.join(publicDir, 'Shayam angan');

    const imageRegex = /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i;
    // Exclude responsive suffix variants like -640w.webp or .avif from direct gallery listing
    const isBaseImage = (file: string) =>
      !/-\d+w\.(webp|avif)$/i.test(file) && !/\.avif$/i.test(file);

    const getCleanImageList = (
      dir: string,
      urlPrefix: string,
      orderPriority: Record<string, number> = {}
    ): string[] => {
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

    const orderPriorityShivani11: Record<string, number> = {
      gate: 1,
      plot: 2,
      middle: 3,
      middle2: 4,
      middle3: 5,
      middle4: 6,
      middle5: 7,
      middle6: 8,
    };

    const orderPriorityShivaniVatika: Record<string, number> = {
      'shivani vatika6 frontgate': 1,
      'shivani vatika': 2,
      'shivani vatik both': 3,
      'shivani vatika3': 4,
      'shivani vatika4': 5,
      'shivani vatika5': 6,
      'shivani vatika7': 7,
    };

    const shivani11Images = getCleanImageList(
      shivani11Dir,
      'Shivani Vatika 11',
      orderPriorityShivani11
    );
    const shivaniVatikaImages = getCleanImageList(
      shivaniVatikaDir,
      'Shivani Vatika',
      orderPriorityShivaniVatika
    );
    const shyamImages = getCleanImageList(shyamDir, 'Shayam angan');

    return NextResponse.json(
      {
        'shivani-vatika': shivaniVatikaImages,
        'shivani-vatika-11': shivani11Images,
        'shivani-vatika-11th': shivani11Images,
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
