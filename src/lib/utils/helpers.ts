import { Prisma } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HOST = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

export function isNumber(value: string) {
  return !isNaN(parseInt(value));
}

type UserWithRoles = Prisma.UserGetPayload<{
  omit: {
    password: true;
  };
  include: {
    roles: {
      select: {
        name: true;
      };
    };
  };
}>;

export function getUserWithRoleArray(user: UserWithRoles) {
  return { ...user, roles: user.roles.map((r) => r.name) };
}
