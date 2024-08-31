import { ApiErrorReponse, ApiResponse, comparePassword, validateBody } from '@/lib/api';
import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { UserWithRoleAsArray } from '@/lib/types';
import sha256 from 'crypto-js/sha256';
import ms from 'ms';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    include: {
      roles: {
        select: {
          name: true,
        },
      },
      token: true,
    },
    where: { email },
  });
}

async function getTokenSettings() {
  return await prisma.tokenSettings.findMany();
}

type GenerateTokensResponse = {
  access_token: string;
  refresh_token: string;
  refreshMaxAge: number;
};

export async function generateTokens(
  userInfo: UserWithRoleAsArray,
): Promise<GenerateTokensResponse> {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtAccessSecret || !jwtRefreshSecret)
    throw new ApiErrorReponse('Missing configuration', 500);

  const { email, roles } = userInfo;
  const payload = { sub: email, roles };

  const tokenSettings = await getTokenSettings();
  const atExpiration = tokenSettings.find((ts) => ts.tokenType === 'access_token')?.expiresIn;
  const rtExpiration = tokenSettings.find((ts) => ts.tokenType === 'refresh_token')?.expiresIn;

  if (!atExpiration || !rtExpiration) throw new ApiErrorReponse('Missing configuration', 500);

  const access_token = jwt.sign(payload, jwtAccessSecret, {
    expiresIn: atExpiration,
  });
  const refresh_token = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: rtExpiration,
  });

  const refreshMaxAge = Math.floor(ms(rtExpiration) / 1000);

  return {
    access_token,
    refresh_token,
    refreshMaxAge,
  };
}

export async function saveRefreshToken(token: string, userId: number) {
  const tokenHash = sha256(token).toString();
  await prisma.token.upsert({
    where: { userId },
    update: { refreshToken: tokenHash },
    create: {
      refreshToken: tokenHash,
      user: { connect: { id: userId } },
    },
  });
}

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
      `refresh_token=${refresh_token}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; Secure; SameSite=Strict`,
    );

    return response;
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
