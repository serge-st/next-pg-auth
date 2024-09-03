import { isApiRequest } from '@/lib/api';
import { CustomMiddleware } from '@/lib/types';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

export function withApiHeadersMiddleware(middleware: CustomMiddleware) {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    // if (!isApiRequest(request)) return middleware(request, event, response);
  };
}
