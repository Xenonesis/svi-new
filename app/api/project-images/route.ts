import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const shivaniDir = path.join(publicDir, 'Shivani Vatika');
    const shyamDir = path.join(publicDir, 'Shayam angan');

    const imageRegex = /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i;

    let shivaniImages: string[] = [];
    if (fs.existsSync(shivaniDir)) {
      shivaniImages = fs
        .readdirSync(shivaniDir)
        .filter((file) => imageRegex.test(file))
        .map((file) => `/Shivani Vatika/${encodeURIComponent(file)}`);
    }

    let shyamImages: string[] = [];
    if (fs.existsSync(shyamDir)) {
      shyamImages = fs
        .readdirSync(shyamDir)
        .filter((file) => imageRegex.test(file))
        .map((file) => `/Shayam angan/${encodeURIComponent(file)}`);
    }

    return NextResponse.json({
      'shivani-vatika': shivaniImages,
      'shyam-aangan': shyamImages,
    });
  } catch (error) {
    console.error('Error reading project images:', error);
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
  }
}
