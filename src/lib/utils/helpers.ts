import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const HOST = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

export function isNumber(value: string) {
  return !isNaN(parseInt(value));
}
