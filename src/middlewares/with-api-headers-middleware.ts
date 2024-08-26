import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { ApiErrorReponse, isApiRequest } from '@/lib/api';
import { CustomMiddleware } from '@/lib/types';
import { headers } from 'next/headers';

export function withApiHeadersMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    if (!isApiRequest(request)) return middleware(request, event, response);

    const method = request.method;
    const headersList = headers();
    const ctHeader = headersList.get('Content-Type');

    // Axios removes the Content-Type header if the body is empty
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (!ctHeader || ctHeader !== 'application/json') {
        return new ApiErrorReponse('Invalid Content-Type', 400);
      }
    }

    return middleware(request, event, response);
  };
}
