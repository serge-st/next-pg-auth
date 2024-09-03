import prisma from '@/lib/db/prisma';
import { UserWithRoleAsArray } from '@/lib/types';
import { GenerateTokensResponse, TokenValidationResult } from './types';
import { ApiErrorReponse } from '@/lib/api';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import sha256 from 'crypto-js/sha256';

export async function getTokenSettings() {
  return await prisma.tokenSettings.findMany();
}

export function getTokenSecrets() {
  const access = process.env.JWT_ACCESS_SECRET!;
  const refresh = process.env.JWT_REFRESH_SECRET!;

  return { access, refresh };
}

export function validateToken(token: string, tokenSecret: string): TokenValidationResult {
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

export async function generateTokens(
  userInfo: UserWithRoleAsArray,
): Promise<GenerateTokensResponse> {
  const { access: jwtAccessSecret, refresh: jwtRefreshSecret } = getTokenSecrets();

  const { email, roles } = userInfo;
  const payload = { sub: email, roles };

  const tokenSettings = await getTokenSettings();
  const atExpiration = tokenSettings.find((ts) => ts.tokenType === 'access_token')?.expiresIn;
  const rtExpiration = tokenSettings.find((ts) => ts.tokenType === 'refresh_token')?.expiresIn;

  if (!atExpiration || !rtExpiration)
    throw new ApiErrorReponse('Missing configuration in the DB', 500);

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
