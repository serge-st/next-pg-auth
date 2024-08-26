import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray, isNumber } from '@/lib/utils/helpers';
import { ApiErrorReponse, ApiResponse } from '@/lib/api';

//TODO delete after testing
const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getUserById(id: string) {
  return await prisma.user.findUnique({
    omit: {
      password: true,
    },
    include: {
      roles: {
        select: {
          name: true,
        },
      },
    },
    where: { id: Number(id) },
  });
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = pathname.split('/').pop();

  if (!id || !isNumber(id)) return new Response('', { status: 400 });

  try {
    // await delay(2000);

    const user = await getUserById(id);

    if (!user) {
      return new ApiErrorReponse('User not found', 404);
    }

    const transformedUser = getUserWithRoleArray(user);

    return new ApiResponse(transformedUser, 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
