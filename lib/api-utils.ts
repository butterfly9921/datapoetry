import { NextResponse } from 'next/server';

export function success(data: any) {
  return NextResponse.json({ success: true, data, error: null });
}

export function error(code: string, message: string, status: number = 400) {
  return NextResponse.json(
    { success: false, data: null, error: { code, message } },
    { status }
  );
}
