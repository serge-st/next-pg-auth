import 'server-only';
import { ApiErrorReponse, ApiResponse, comparePassword, validateBody } from '@/lib/api';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateTokens, saveRefreshToken } from '../tokens';
import { getUserByEmail } from '../helpers';
import { REFRESH_TOKEN } from '@/lib/constants';
import { cookies } from 'next/headers';
import { getHTTPCookieOptions } from '@/lib/api/helpers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateBody(body, loginSchema);
    if (validationError) return new ApiErrorReponse('Please check you login credentials', 401);

    const { email, password } = loginSchema.parse(body);
    const user = await getUserByEmail(email);

    if (!user || !user.password)
      return new ApiErrorReponse('Please check you login credentials', 401);

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return new ApiErrorReponse('Please check you login credentials', 401);

    const { access_token, refresh_token, refreshMaxAge } = await generateTokens(
      getUserWithRoleArray(user),
    );
    await saveRefreshToken(refresh_token, user.id);

    cookies().set(REFRESH_TOKEN, refresh_token, getHTTPCookieOptions(refreshMaxAge));

    return new ApiResponse({ access_token }, 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
