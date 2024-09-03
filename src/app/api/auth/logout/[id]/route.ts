import { ApiErrorReponse, ApiResponse, extractUserId } from '@/lib/api';
import { NextRequest } from 'next/server';
import { deleteRefreshToken } from '../../tokens';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  const id = extractUserId(request);
  if (!id) return new ApiErrorReponse('Invalid ID', 400);

  try {
    await deleteRefreshToken(Number(id));

    return new ApiResponse({ message: `User with ID: ${id} was logged out` }, 200);
  } catch (error) {
    console.error(error);

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025')
      return new ApiErrorReponse('Token not found', 404);

    return new ApiErrorReponse('An error occurred', 500);
  }
}
