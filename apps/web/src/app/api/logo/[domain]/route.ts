import { NextRequest } from 'next/server';

const LOGO_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY;
const CACHE_SECONDS = 180 * 24 * 60 * 60; // 180 days

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;

  if (!LOGO_KEY) {
    return new Response(null, { status: 503 });
  }

  const size = request.nextUrl.searchParams.get('size') ?? '128';
  const format = request.nextUrl.searchParams.get('format') ?? 'png';

  const upstream = await fetch(
    `https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGO_KEY}&size=${size}&format=${format}&fallback=404`,
    { next: { revalidate: CACHE_SECONDS } },
  );

  if (!upstream.ok) {
    return new Response(null, { status: 404 });
  }

  const body = upstream.body;
  const contentType = upstream.headers.get('content-type') ?? 'image/png';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, immutable`,
      'CDN-Cache-Control': `public, max-age=${CACHE_SECONDS}, immutable`,
    },
  });
}
