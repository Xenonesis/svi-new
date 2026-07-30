import { NextResponse } from 'next/server';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function bad(message: string, status = 400, code = 'BAD_REQUEST', details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}
