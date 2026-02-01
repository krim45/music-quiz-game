import { NextResponse } from 'next/server';

function buildUrl(req: Request, path: string[]) {
  const { searchParams } = new URL(req.url);
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) throw new Error('API_BASE_URL is not set');

  const joined = path.map(encodeURIComponent).join('/');
  const qs = searchParams.toString();
  return `${baseUrl}/${joined}${qs ? `?${qs}` : ''}`;
}

/**
 * 프론트 -> 백엔드에 전달해도 되는 헤더만 골라 전달
 * (hop-by-hop 헤더 제거 + 인증 관련 헤더 포함)
 */
function buildForwardHeaders(req: Request) {
  const incoming = req.headers;
  const headers = new Headers();

  // ✅ 보통 백엔드 인증에 필요한 것들
  const allowList = [
    'authorization',
    'cookie',
    'content-type',
    'accept',
    'user-agent',
    'x-request-id',
    'x-forwarded-for',
    'x-forwarded-proto',
  ];

  for (const key of allowList) {
    const v = incoming.get(key);
    if (v) headers.set(key, v);
  }

  // ✅ 백엔드 입장에서 원래 요청 host를 알고 싶을 때 유용
  const { origin } = new URL(req.url);
  headers.set('x-forwarded-origin', origin);

  return headers;
}

/**
 * JSON/텍스트/빈바디(204)까지 안전 파싱
 */
async function safeReadBody(res: Response) {
  const contentType = res.headers.get('content-type') || '';

  // 204, 205 같은 바디가 없는 케이스 방어
  if (res.status === 204 || res.status === 205) return null;

  // JSON이면 json() 시도
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      // content-type은 json인데 깨진 경우 대비
      const text = await res.text().catch(() => '');
      return text ? { message: text } : null;
    }
  }

  // JSON이 아니면 텍스트로 읽기
  const text = await res.text().catch(() => '');
  return text || null;
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await ctx.params;
    const url = buildUrl(req, path);

    const res = await fetch(url, {
      method: 'GET',
      headers: buildForwardHeaders(req),
      cache: 'no-store',
    });

    const body = await safeReadBody(res);

    return NextResponse.json(body, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';

    return NextResponse.json({ message, code: 'PROXY_ERROR' }, { status: 500 });
  }
}
