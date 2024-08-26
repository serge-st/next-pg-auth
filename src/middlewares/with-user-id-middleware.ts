import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { isNumber } from '@/lib/utils/helpers';
import { ApiErrorReponse, isApiRequest } from '@/lib/api';
import { CustomMiddleware } from '@/lib/types';

export function withUserIdMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    const { pathname } = request.nextUrl;

    const matcher = /.*\/users\/(.+)/gi;

    if (!matcher.test(pathname)) return middleware(request, event, response);

    const id = pathname.split('/').pop();

    if (id && isNumber(id)) return middleware(request, event, response);

    return isApiRequest(request)
      ? new ApiErrorReponse('Invalid ID', 400)
      : NextResponse.redirect(new URL('/users', request.url));
  };
}
