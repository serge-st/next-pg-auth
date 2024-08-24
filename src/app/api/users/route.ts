import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray } from '@/lib/utils/helpers';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest } from 'next/server';
import { z } from 'zod';

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

function checkHeaders(request: NextRequest) {
  const ctHeader = request.headers.get('Content-Type');

  if (!ctHeader || ctHeader !== 'application/json') {
    return new Response(JSON.stringify({ error: 'Invalid Content-Type' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  return undefined;
}

// TODO remove afeter testing
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(request: NextRequest) {
  const incorrectHeader = checkHeaders(request);

  if (incorrectHeader) return incorrectHeader;

  try {
    const users = await getUsers();
    const transormedUsers = users.map((u) => getUserWithRoleArray(u));
    return new Response(JSON.stringify(transormedUsers), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string(),
});

function validateUser(body: any) {
  const validationResult = userSchema.safeParse(body);
  if (!validationResult.success) {
    return new Response(JSON.stringify({ errors: validationResult.error.errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  const incorrectHeader = checkHeaders(request);

  if (incorrectHeader) return incorrectHeader;

  try {
    const body = await request.json();

    const validationError = validateUser(body);
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
    return new Response('', { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      return new Response(JSON.stringify({ error: 'Role does not exist' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
