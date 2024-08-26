import { NextRequest } from 'next/server';
import { ApiErrorReponse } from './api-error-response';
import { ZodSchema } from 'zod';

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
