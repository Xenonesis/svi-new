import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';
// GET /api/admin/translate?text=...&from=en&to=hi
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const sl = searchParams.get('from') || 'en';
    const tl = searchParams.get('to') || 'hi';

    if (!text || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }

    const trimmed = text.trim();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Google Translate response status: ${res.status}`);
    }

    const data = await res.json();
    let translatedText = '';

    if (Array.isArray(data) && Array.isArray(data[0])) {
      translatedText = data[0].map((item: any) => item[0]).join('');
    }

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error('Server translation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
