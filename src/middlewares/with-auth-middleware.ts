import { ApiErrorReponse, isApiRequest, isRouteAllowed } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { CustomMiddleware, Roles, ValidateResponse } from '@/lib/types';
import { HOST } from '@/lib/utils/helpers';
import axios from 'axios';
import { headers } from 'next/headers';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/validate'];

export function withAuthMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    if (!isApiRequest(request)) return middleware(request, event, response);

    const { pathname } = request.nextUrl;

    if (PUBLIC_ROUTES.includes(pathname)) return middleware(request, event, response);

    const headersList = headers();
    const bearerHeader = headersList.get('Authorization');
    if (!bearerHeader) return new ApiErrorReponse('Please check you login credentials', 401);

    const accessToken = bearerHeader?.split(' ')[1];
    if (!accessToken) return new ApiErrorReponse('Please check you login credentials', 401);

    try {
      const validationResponse = await axios.post<ValidateResponse>(
        `${HOST}/api/auth/validate`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const { data } = validationResponse;
      const [role] = data.payload?.roles;
      const allowedRoutes = API_ROUTES[role as Roles];

      if (!isRouteAllowed(pathname, allowedRoutes))
        throw new Error('Error during token validation');

      return middleware(request, event, response);
    } catch (error) {
      console.error('error', error);
      return new ApiErrorReponse('Unauthorized', 401);
    }
  };
}
