import { NextRequest } from 'next/server';
import { isNumber } from '../utils/helpers';

export function extractUserId(request: NextRequest): string | undefined {
  const { pathname } = request.nextUrl;
  const id = pathname.split('/').pop();

  if (!id || !isNumber(id)) return undefined;

  return id;
}
