import { NextResponse, type NextRequest } from 'next/server';
import { isNumber } from '@/lib/utils/helpers';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRequest = /^\/api/gi.test(pathname);
  const id = pathname.split('/').pop();

  if (id && isNumber(id)) return NextResponse.next();

  return isApiRequest
    ? new Response('', { status: 400 })
    : NextResponse.redirect(new URL('/users', request.url));
}

// Only paths with params are matched
export const config = {
  matcher: ['/users/(.+)', '/api/users/(.+)'],
};
