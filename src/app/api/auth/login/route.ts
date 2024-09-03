import { ApiErrorReponse, ApiResponse, comparePassword, validateBody } from '@/lib/api';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateTokens, saveRefreshToken } from '../tokens';
import { getUserByEmail } from '../helpers';
import { REFRESH_TOKEN } from '../constants';

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

    const response = new ApiResponse({ access_token }, 200);
    response.headers.append(
      'Set-Cookie',
      `${REFRESH_TOKEN}=${refresh_token}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; Secure; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
