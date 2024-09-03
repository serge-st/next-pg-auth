import prisma from '@/lib/db/prisma';

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    include: {
      roles: {
        select: {
          name: true,
        },
      },
      token: true,
    },
    where: { email },
  });
}
