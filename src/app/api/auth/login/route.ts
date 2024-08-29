import { ApiErrorReponse, ApiResponse, comparePassword, validateBody } from '@/lib/api';
import prisma from '@/lib/db/prisma';
import { NextRequest } from 'next/server';
import { z } from 'zod';

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

    // TODO return token
    return new ApiResponse('', 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
