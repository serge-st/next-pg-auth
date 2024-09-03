import { ApiErrorReponse, ApiResponse, isValidSHA256 } from '@/lib/api';
import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { getUserByEmail } from '../helpers';
import { generateTokens, getTokenSecrets, saveRefreshToken, validateToken } from '../tokens';
import { ValidateResponse } from './types';
import { REFRESH_TOKEN } from '@/lib/constants';

export async function POST(_request: NextRequest): Promise<ApiResponse<ValidateResponse>> {
  const tokenSecret = getTokenSecrets();

  const headersList = headers();
  const bearerHeader = headersList.get('Authorization');
  if (!bearerHeader) return new ApiErrorReponse('Please check you login credentials', 401);

  const accessToken = bearerHeader?.split(' ')[1];
  if (!accessToken) return new ApiErrorReponse('Please check you login credentials', 401);

  try {
    // Check access token
    const accessValidationResult = validateToken(accessToken, tokenSecret.access);

    if (accessValidationResult.status === 'error')
      return new ApiErrorReponse('Please check you login credentials', 401);

    if (accessValidationResult.status === 'success')
      return new ApiResponse({ payload: accessValidationResult.payload }, 200);

    // If access token is expired, check refresh token
    const httpOnlyCookies = cookies();
    const refreshToken = httpOnlyCookies.get(REFRESH_TOKEN)?.value;
    if (!refreshToken) return new ApiErrorReponse('Please login', 401);

    const refreshValidationResult = validateToken(refreshToken, tokenSecret.refresh);

    if (refreshValidationResult.status === 'error')
      return new ApiErrorReponse('Please check you login credentials', 401);

    if (refreshValidationResult.status === 'expired')
      return new ApiErrorReponse('Token expired, please login', 401);

    if (refreshValidationResult.status !== 'success')
      return new ApiErrorReponse('Unexpected error', 500);

    const user = await getUserByEmail(refreshValidationResult.payload.sub);
    if (!user) return new ApiErrorReponse('Please login', 401);
    if (!user.token?.refreshToken) return new ApiErrorReponse('Please login', 401);

    const isValidRefreshToken = isValidSHA256(refreshToken, user.token.refreshToken);

    if (!isValidRefreshToken) return new ApiErrorReponse('Please login', 401);

    const { access_token, refresh_token, refreshMaxAge } = await generateTokens(
      getUserWithRoleArray(user),
    );
    await saveRefreshToken(refresh_token, user.id);

    const response = new ApiResponse(
      { payload: refreshValidationResult.payload, access_token },
      200,
    );
    response.headers.append(
      'Set-Cookie',
      `${REFRESH_TOKEN}=${refresh_token}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; Secure; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.log(error);
    return new ApiErrorReponse('Unexpected error', 500);
  }
}
