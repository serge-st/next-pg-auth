import prisma from '@/lib/db/prisma';
import { getUserWithRoleArray } from '@/lib/utils/helpers';

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

export async function GET() {
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
