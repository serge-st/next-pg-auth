import { apiClient, ApiErrorReponse, isApiRequest } from '@/lib/api';
import { CustomMiddleware, RoleRoutes } from '@/lib/types';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from '@/lib/constants';

export function withAuthMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    // if (isApiRequest(request)) return middleware(request, event, response);

    // console.log(localStorageAccessToken.get());

    return middleware(request, event, response);

    const { pathname } = request.nextUrl;

    if (pathname === '/') return middleware(request, event, response);

    const headersList = headers();

    if (isApiRequest(request)) {
    } else {
      console.log('withAuthMiddleware req', pathname);
    }

    // console.log('req', request.nextUrl.pathname);
    // console.log('hed', headersList);

    // const result = await apiClient.post('/auth/validate', {});
    // console.log('res', result);

    return middleware(request, event, response);

    // if (!isApiRequest(request)) return middleware(request, event, response);

    // new ApiErrorReponse('Unauthorized', 401);

    // NextResponse.redirect(new URL('/users', request.url));
  };
}
