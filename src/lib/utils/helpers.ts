import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UserWithRoles } from '@/lib/types';
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from '../constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HOST = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

export function isNumber(value: string) {
  return !isNaN(parseInt(value));
}

export function getUserWithRoleArray(user: UserWithRoles) {
  return { ...user, roles: user.roles.map((r) => r.name) };
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const localStorageAccessToken = {
  set: (token: string) => localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, token),
  get: () => localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY),
  remove: () => localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY),
};
