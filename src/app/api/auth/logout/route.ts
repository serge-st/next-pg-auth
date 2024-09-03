import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { REFRESH_TOKEN } from '../constants';
import { ApiErrorReponse, ApiResponse } from '@/lib/api';
import { deleteRefreshToken, getTokenSecrets, validateToken } from '../tokens';
import { getUserByEmail } from '../helpers';

export async function POST(_request: NextRequest) {
  const httpOnlyCookies = cookies();
  const refreshToken = httpOnlyCookies.get(REFRESH_TOKEN)?.value;
  if (!refreshToken) return new ApiResponse({ message: 'Already logged out' }, 200);

  try {
    const refreshValidationResult = validateToken(refreshToken, getTokenSecrets().refresh);

    if (refreshValidationResult.status !== 'success')
      return new ApiResponse({ message: 'Already logged out' }, 200);

    const user = await getUserByEmail(refreshValidationResult.payload.sub);

    if (!user) return new ApiResponse({ message: 'Already logged out' }, 200);

    await deleteRefreshToken(user.id);

    httpOnlyCookies.delete(REFRESH_TOKEN);

    const response = new ApiResponse({ message: 'Logged out' }, 200);
    response.headers.append(
      'Set-Cookie',
      `${REFRESH_TOKEN}=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('Unexpected error', 500);
  }
}
