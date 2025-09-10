// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  const BASIC_USER = process.env.BASIC_AUTH_USER;
  const BASIC_PASS = process.env.BASIC_AUTH_PASS;

  // allow Vercel health checks, static assets, and _next
  const url = new URL(req.url);
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization');
  if (!auth || !BASIC_USER || !BASIC_PASS) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Private"' },
    });
  }

  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic') {
    return new NextResponse('Malformed auth', { status: 400 });
  }

  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  if (user === BASIC_USER && pass === BASIC_PASS) {
    return NextResponse.next();
  }

  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Private"' },
  });
}

export const config = {
  matcher: ['/((?!api/health).*)'], // protect everything except a health endpoint if you have one
};
