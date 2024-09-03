import { REFRESH_TOKEN } from '@/lib/constants';
import { hashPassword } from '../src/lib/api';
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

const addUser = async (email: string, password: string, role: string) => {
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      roles: {
        connect: {
          name: role,
        },
      },
    },
  });
};

const addDomainAdminUser = async () => {
  if (!process.env.ADMIN_EMAIL) throw new Error('Missing ADMIN_EMAIL env var');
  if (!process.env.ADMIN_PASSWORD) throw new Error('Missing ADMIN_PASSWORD env var');
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  await addUser(email, password, 'admin');
};

const addTokenDefaults = async () => {
  await prisma.tokenSettings.create({
    data: {
      tokenType: 'access_token',
      expiresIn: '30m',
    },
  });

  await prisma.tokenSettings.create({
    data: {
      tokenType: REFRESH_TOKEN,
      expiresIn: '7d',
    },
  });
};

const addTestUsers = async () => {
  if (process.env.NODE_ENV === 'production') return;
  const savedUsers = await prisma.user.findMany();
  if (savedUsers.length > 1) return;
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
      email: 'third@mail.com',
      password: 'password',
    },
  ];

  for (const user of users) {
    await addUser(user.email, user.password, 'user');
  }
};

const load = async () => {
  try {
    await addRoles();
    await addDomainAdminUser();
    await addTokenDefaults();
    await addTestUsers();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
