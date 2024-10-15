import 'server-only';
import { ApiErrorReponse, ApiResponse, isValidSHA256 } from '@/lib/api';
import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { getUserByEmail } from '../helpers';
import { generateTokens, getTokenSettings, saveRefreshToken, validateToken } from '../tokens';
import { REFRESH_TOKEN } from '@/lib/constants';
import { getHTTPCookieOptions } from '@/lib/api/helpers';
import { ValidateResponse } from '@/lib/types';

export async function POST(_request: NextRequest): Promise<ApiResponse<ValidateResponse>> {
  const tokenSettings = await getTokenSettings();

  const headersList = headers();
  const bearerHeader = headersList.get('Authorization');
  if (!bearerHeader) return new ApiErrorReponse('Please check you login credentials', 401);

  const accessToken = bearerHeader?.split(' ')[1];
  if (!accessToken) return new ApiErrorReponse('Please check you login credentials', 401);

  try {
    // Check access token
    const accessValidationResult = validateToken(accessToken, tokenSettings.access.secret);

    if (accessValidationResult.status === 'error')
      return new ApiErrorReponse('Please check you login credentials', 401);

    if (accessValidationResult.status === 'success')
      return new ApiResponse({ payload: accessValidationResult.payload }, 200);

    // If access token is expired, check refresh token
    const httpOnlyCookies = cookies();
    const refreshToken = httpOnlyCookies.get(REFRESH_TOKEN)?.value;
    if (!refreshToken) return new ApiErrorReponse('Please login', 401);

    const refreshValidationResult = validateToken(refreshToken, tokenSettings.refresh.secret);

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

    httpOnlyCookies.set(REFRESH_TOKEN, refresh_token, getHTTPCookieOptions(refreshMaxAge));

    return new ApiResponse({ payload: refreshValidationResult.payload, access_token }, 200);
  } catch (error) {
    console.log(error);
    return new ApiErrorReponse('Unexpected error', 500);
  }
}
