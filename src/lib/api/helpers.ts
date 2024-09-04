import { NextRequest } from 'next/server';
import { ApiErrorReponse } from './api-error-response';
import { ZodSchema } from 'zod';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export function isApiRequest(request: NextRequest) {
  return request.nextUrl.pathname.startsWith('/api/');
}

export function validateBody(body: any, schema: ZodSchema<any>) {
  const validationResult = schema.safeParse(body);
  if (!validationResult.success) {
    return new ApiErrorReponse(validationResult.error, 400);
  }

  return undefined;
}

export function getHTTPCookieOptions(maxAgeSeconds: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: true,
    maxAge: maxAgeSeconds,
    sameSite: 'lax',
    path: '/',
  };
}
