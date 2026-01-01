import { NextResponse } from 'next/server';

function buildUrl(req: Request, path: string[]) {
  const { searchParams } = new URL(req.url);
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) throw new Error('API_BASE_URL is not set');

  const joined = path.map(encodeURIComponent).join('/');
  const qs = searchParams.toString();
  return `${baseUrl}/${joined}${qs ? `?${qs}` : ''}`;
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  const url = buildUrl(req, ctx.params.path);

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
