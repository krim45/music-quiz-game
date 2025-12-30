import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const baseUrl = process.env.API_BASE_URL!;
  const url = `${baseUrl}/songs?${searchParams.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
