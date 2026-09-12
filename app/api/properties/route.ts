import { NextRequest, NextResponse } from 'next/server';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { propertyRepository } from '@/src/lib/repositories';

export const runtime = 'nodejs';

const DEFAULT_PROPERTIES = [
  { id: '1', name: 'Shivani Vatika', slug: 'shivani-vatika', active: true },
  { id: '2', name: 'Shayam Angan', slug: 'shayam-angan', active: true },
  { id: '3', name: 'SVI Emerald Enclave', slug: 'svi-emerald-enclave', active: true },
];

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(request: NextRequest) {
  try {
    const { data: properties, error } = await propertyRepository.listActive();
    if (error || !properties || properties.length === 0) {
      return NextResponse.json({ properties: DEFAULT_PROPERTIES }, { headers: CACHE_HEADERS });
    }
    return NextResponse.json({ properties }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ properties: DEFAULT_PROPERTIES }, { headers: CACHE_HEADERS });
  }
}
