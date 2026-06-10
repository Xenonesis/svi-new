import { NextRequest, NextResponse } from 'next/server';
import { AppError, handleApiError } from '@/src/lib/api/errors';
import { propertyRepository } from '@/src/lib/repositories';

export async function GET(request: NextRequest) {
  try {
    const { data: properties, error } = await propertyRepository.listActive();
    if (error) throw AppError.internal('Failed to fetch properties');
    return NextResponse.json({ properties: properties || [] });
  } catch (err) {
    return handleApiError(err);
  }
}
