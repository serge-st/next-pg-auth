import { NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  response: NextResponse,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;
