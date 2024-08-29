import { ApiErrorReponse, ApiResponse, comparePassword, validateBody } from '@/lib/api';
import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { UserWithRoleAsArray } from '@/lib/types';
import sha256 from 'crypto-js/sha256';
import { create } from 'domain';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    include: {
      roles: {
        select: {
          name: true,
        },
      },
    },
    where: { email },
  });
}

async function getTokenSettings() {
  return await prisma.tokenSettings.findMany();
}

async function generateTokens(userInfo: UserWithRoleAsArray) {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtAccessSecret || !jwtRefreshSecret) throw new Error('Missing configuration');

  const { email, roles } = userInfo;
  const payload = { sub: email, roles };

  const tokenSettings = await getTokenSettings();
  const atExpiration = tokenSettings.find((ts) => ts.tokenType === 'access_token')?.expiresIn;
  const rtExpiration = tokenSettings.find((ts) => ts.tokenType === 'refresh_token')?.expiresIn;

  if (!atExpiration || !rtExpiration) throw new Error('Missing configuration');

  const access_token = jwt.sign(payload, jwtAccessSecret, {
    expiresIn: atExpiration,
  });
  const refresh_token = jwt.sign(payload, jwtRefreshSecret, {
    expiresIn: rtExpiration,
  });

  return {
    access_token,
    refresh_token,
  };
}

async function saveToken(token: string, userId: number) {
  await prisma.token.upsert({
    where: { userId },
    update: { refreshToken: sha256(token).toString() },
    create: {
      refreshToken: sha256(token).toString(),
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

    const tokens = await generateTokens(getUserWithRoleArray(user));
    await saveToken(tokens.refresh_token, user.id);

    return new ApiResponse(tokens, 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
