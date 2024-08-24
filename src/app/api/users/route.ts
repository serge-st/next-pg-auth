import prisma from '@/lib/db/prisma';

async function getUsers() {
  return await prisma.user.findMany({
    omit: {
      password: true,
    },
  });
}

export async function GET() {
  try {
    const users = await getUsers();
    return new Response(JSON.stringify(users), {
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
