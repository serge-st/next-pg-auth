import { ApiErrorReponse, ApiResponse, validateBody } from '@/lib/api';
import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest } from 'next/server';
import { userSchema } from './user-schema';

async function getUsers() {
  return await prisma.user.findMany({
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
  });
}

export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    const transormedUsers = users.map((u) => getUserWithRoleArray(u));

    return new ApiResponse(transormedUsers, 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateBody(body, userSchema);
    if (validationError) return validationError;

    await prisma.user.create({
      data: {
        email: body.email,
        // TODO: encrypt password
        password: body.password,
        roles: {
          connect: {
            name: body.role,
          },
        },
      },
    });
    return new ApiResponse('', 201);
  } catch (error) {
    console.error(error);

    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return new ApiErrorReponse('Invalid Body', 400);
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ApiErrorReponse('User with this email already exists', 400);
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return new ApiErrorReponse('Role does not exist', 400);
    }

    return new ApiErrorReponse('An error occurred', 500);
  }
}
