import type { MiddlewareConfig } from 'next/server';
import { chain, withUserIdMiddleware, withApiHeadersMiddleware } from '@/middlewares';
import { withAuthMiddleware } from './middlewares/with-auth-middleware';

export default chain([withApiHeadersMiddleware, withAuthMiddleware, withUserIdMiddleware]);

export const config: MiddlewareConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
