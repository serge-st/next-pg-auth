import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray, isNumber } from '@/lib/utils/helpers';
import { ApiErrorReponse, ApiResponse, validateBody } from '@/lib/api';
import { userSchema } from '../user-schema';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hashPassword } from '@/lib/api';

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

async function getRoles() {
  return await prisma.role.findMany();
}

async function updateUserById(id: string, body: Record<string, unknown>) {
  const roles = await getRoles();

  const { email, password, role } = body;

  const data: Record<string, unknown> = {};

  if (email) {
    data.email = email;
  }

  if (password && typeof password === 'string') {
    const hashedPassword = await hashPassword(password);
    data.password = hashedPassword;
  }

  if (role) {
    data.roles = {
      disconnect: roles,
      connect: {
        name: role,
      },
    };
  }

  return await prisma.user.update({
    where: { id: Number(id) },
    data,
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

async function deleteUserById(id: string) {
  await prisma.user.delete({
    where: { id: Number(id) },
  });
}

function extractUserId(request: NextRequest): string | undefined {
  const { pathname } = request.nextUrl;
  const id = pathname.split('/').pop();

  if (!id || !isNumber(id)) return undefined;

  return id;
}

export async function GET(request: NextRequest) {
  const id = extractUserId(request);
  if (!id) return new ApiErrorReponse('Invalid ID', 400);

  try {
    const user = await getUserById(id);
    if (!user) return new ApiErrorReponse('User not found', 404);

    const transformedUser = getUserWithRoleArray(user);

    return new ApiResponse(transformedUser, 200);
  } catch (error) {
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}

const partialUserSchema = userSchema.partial().strict();

export async function PATCH(request: NextRequest) {
  const id = extractUserId(request);
  if (!id) return new ApiErrorReponse('Invalid ID', 400);

  try {
    const user = await getUserById(id);
    if (!user) return new ApiErrorReponse('User not found', 404);

    const body = await request.json();

    if (Object.keys(body).length === 0) return new ApiErrorReponse('Invalid body', 400);

    const validationError = validateBody(body, partialUserSchema);
    if (validationError) return validationError;

    const updatedUser = await updateUserById(id, body);

    return new ApiResponse(getUserWithRoleArray(updatedUser), 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ApiErrorReponse('User with this email already exists', 400);
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return new ApiErrorReponse('Role does not exist', 400);
    }

    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const id = extractUserId(request);
  if (!id) return new ApiErrorReponse('Invalid ID', 400);

  try {
    await deleteUserById(id);
    return new ApiResponse('', 200);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return new ApiErrorReponse('User does not exist', 400);
    }
    console.error(error);
    return new ApiErrorReponse('An error occurred', 500);
  }
}
