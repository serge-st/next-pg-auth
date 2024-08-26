import type { MiddlewareConfig } from 'next/server';
import { chain, withUserIdMiddleware, withApiHeadersMiddleware } from '@/middlewares';

export default chain([withApiHeadersMiddleware, withUserIdMiddleware]);

export const config: MiddlewareConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
