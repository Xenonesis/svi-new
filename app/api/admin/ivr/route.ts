import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
import { AppError, handleApiError } from '@/src/lib/api/errors';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'history';

    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const virtualNumber = searchParams.get('virtual_number');
    const toNumber = searchParams.get('to_number');
    const fromNumber = searchParams.get('from_number');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const apiKey =
      process.env.IVR_API_KEY || 'Qvh4BftGjuhX259zInjeajZ8cwoCtuH2FR2Z36dbasiQIkqRSxKrFfclZcE4';

    const targetUrl =
      action === 'outgoing-history'
        ? 'http://49.50.106.182/api/outcalls'
        : 'http://49.50.106.182/api/calls';

    // Construct query parameters for the real API
    const apiParams = new URLSearchParams();
    apiParams.append('token', apiKey);
    apiParams.append('offset', String(offset));
    apiParams.append('limit', String(limit));
    if (virtualNumber) apiParams.append('virtual_number', virtualNumber);
    if (toNumber) apiParams.append('to_number', toNumber);
    if (fromNumber) apiParams.append('from_number', fromNumber);
    if (status) apiParams.append('status', status.toUpperCase()); // "ANSWERED" or "MISSED"
    if (startDate) apiParams.append('start_date', startDate);
    if (endDate) apiParams.append('end_date', endDate);

    try {
      const res = await fetch(`${targetUrl}?${apiParams.toString()}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      } else {
        const errText = await res.text();
        console.error(`IVR Gateway returned error status: ${res.status}. Body: ${errText}`);
        return NextResponse.json(
          {
            status: {
              code: res.status,
              message: `Gateway Error: ${errText || res.statusText}`,
            },
            data: [],
          },
          { status: res.status }
        );
      }
    } catch (apiError: any) {
      console.error(`IVR API network connection failed:`, apiError);
      return NextResponse.json(
        {
          status: {
            code: 502,
            message: `Telephony Gateway Unreachable: ${apiError.message || apiError}`,
          },
          data: [],
        },
        { status: 502 }
      );
    }
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) throw AppError.unauthorized();

    const body = await request.json();
    const { from_number, to_number } = body;

    if (!from_number || !to_number) {
      return NextResponse.json(
        {
          status: {
            code: 400,
            message: 'Missing parameters: from_number and to_number are required.',
          },
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.IVR_API_KEY || 'Qvh4BftGjuhX259zInjeajZ8cwoCtuH2FR2Z36dbasiQIkqRSxKrFfclZcE4';

    try {
      const res = await fetch(`http://49.50.106.182/api/createCall?token=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          from_number: String(from_number),
          to_number: String(to_number),
        }).toString(),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      } else {
        const errText = await res.text();
        return NextResponse.json(
          {
            status: {
              code: res.status,
              message: `Gateway Error: ${errText || res.statusText}`,
            },
          },
          { status: res.status }
        );
      }
    } catch (apiError: any) {
      console.error(`IVR Outgoing Call API request failed:`, apiError);
      return NextResponse.json(
        {
          status: {
            code: 502,
            message: `Telephony Gateway Unreachable: ${apiError.message || apiError}`,
          },
        },
        { status: 502 }
      );
    }
  } catch (err) {
    return handleApiError(err);
  }
}
