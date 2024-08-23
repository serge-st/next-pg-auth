import { ROLES } from './data';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const addRoles = async () => {
  const roles = await prisma.role.findMany();
  const existingRoleNames = new Set(roles.map((r) => r.name));

  const rolesToAdd = ROLES.filter((role) => !existingRoleNames.has(role));

  if (rolesToAdd.length === 0) return;

  for (const role of rolesToAdd) {
    await prisma.role.create({
      data: {
        name: role,
      },
    });
  }
};

const addTestUsers = async () => {
  if (process.env.NODE_ENV === 'production') return;
  const savedUsers = await prisma.user.findMany();
  if (savedUsers.length > 0) return;
  const users: Prisma.UserCreateInput[] = [
    {
      email: 'test_user@mail.com',
      password: 'password',
    },
    {
      email: '2nd_u@mail.com',
      password: 'password',
    },
    {
      email: 'admin@mail.com',
      password: 'password',
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        roles: {
          connect: {
            name: user.email === 'admin@mail.com' ? 'admin' : 'user',
          },
        },
      },
    });
  }
};

const load = async () => {
  try {
    await addRoles();
    await addTestUsers();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
