import prisma from '@/lib/db/prisma';
import { NextRequest } from 'next/server';

const getRoles = async (namesOnly?: boolean) => {
  const roles = await prisma.role.findMany();

  return namesOnly ? roles.map((role) => role.name) : roles;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const namesOnly = !!searchParams.get('names_only');

    const roles = await getRoles(namesOnly);

    return new Response(JSON.stringify(roles), {
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
