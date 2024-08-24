import { NextRequest } from 'next/server';
import prisma from '@/lib/db/prisma';
import { isNumber } from '@/lib/utils/helpers';

async function getUserById(id: string) {
  return await prisma.user.findUnique({
    omit: {
      password: true,
    },
    where: { id: Number(id) },
  });
}

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = pathname.split('/').pop();

  if (!id || !isNumber(id)) return new Response('', { status: 400 });

  try {
    const user = await getUserById(id);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), {
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
