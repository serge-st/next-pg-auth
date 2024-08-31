import { ApiErrorReponse, ApiResponse } from '@/lib/api';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import { generateTokens, getUserByEmail, saveRefreshToken } from '../login/route';
import sha256 from 'crypto-js/sha256';
import { getUserWithRoleArray } from '@/lib/utils/helpers';

function getTokenSecrets() {
  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;

  if (!access || !refresh) return undefined;

  return { access, refresh };
}

function isValidSHA256(input: string, hash: string) {
  return sha256(input).toString() === hash;
}

type TokenValidationStatus = 'expired' | 'error';

type TokenValidationResult =
  | { status: 'success'; payload: any }
  | { status: TokenValidationStatus };

function validateToken(token: string, tokenSecret: string): TokenValidationResult {
  try {
    return {
      status: 'success',
      payload: jwt.verify(token, tokenSecret),
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { status: 'expired' };
    } else {
      return { status: 'error' };
    }
  }
}

type ValidateResponse = {
  payload: any;
  access_token?: string;
};

export async function POST(_request: NextRequest): Promise<ApiResponse<ValidateResponse>> {
  const tokenSecret = getTokenSecrets();
  if (!tokenSecret) return new ApiErrorReponse('Missing configuration', 500);

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
    const refreshToken = httpOnlyCookies.get('refresh_token')?.value;
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
      `refresh_token=${refresh_token}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; Secure; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.log(error);
    return new ApiErrorReponse('Unexpected error', 500);
  }
}
