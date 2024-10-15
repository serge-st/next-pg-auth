import prisma from '@/lib/db/prisma';
import { UserWithRoleAsArray } from '@/lib/types';
import { GenerateTokensResponse, TokenValidationResult } from './types';
import { ApiErrorReponse } from '@/lib/api';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import sha256 from 'crypto-js/sha256';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/lib/constants';

export async function getTokenSettings() {
  const result = await prisma.tokenSettings.findMany();
  const atSettings = result.find((ts) => ts.tokenType === ACCESS_TOKEN);
  const rtSettings = result.find((ts) => ts.tokenType === REFRESH_TOKEN);

  if (!atSettings || !rtSettings) throw new ApiErrorReponse('Missing configuration in the DB', 500);

  return { access: atSettings, refresh: rtSettings };
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
  const { email, roles } = userInfo;
  const payload = { sub: email, roles };

  const tokenSettings = await getTokenSettings();

  const access_token = jwt.sign(payload, tokenSettings.access.secret, {
    expiresIn: tokenSettings.access.expiresIn,
  });
  const refresh_token = jwt.sign(payload, tokenSettings.refresh.secret, {
    expiresIn: tokenSettings.refresh.expiresIn,
  });

  const refreshMaxAge = Math.floor(ms(tokenSettings.refresh.expiresIn) / 1000);

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

export async function deleteRefreshToken(userId: number) {
  await prisma.token.delete({ where: { userId } });
}
