import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // SKIP_AUTH is a development-only convenience and is ignored in production.
  if (process.env.NODE_ENV !== 'production' && process.env.SKIP_AUTH === 'true') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/app')) return NextResponse.next();

  const token = request.cookies.get('atlas_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
