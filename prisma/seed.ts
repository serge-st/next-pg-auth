import { REFRESH_TOKEN, ACCESS_TOKEN } from '@/lib/constants';
import { hashPassword } from '../src/lib/api';
import { ROLES } from './data';
import { Prisma, PrismaClient } from '@prisma/client';
import { generatePassword } from './generatePassword';
import fs from 'fs';
import path from 'path';
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

  try {
    const email = process.env.ADMIN_EMAIL;
    const password = generatePassword(16);
    await addUser(email, password, 'admin');
    const text = `# Admin User Credentials:\n${email}\n${password}\n`;
    fs.writeFileSync(path.join(__dirname, '..', 'app-setup', 'password.txt'), text);
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
    if (e.code === 'P2002') {
      console.log('Admin user already exists');
      return;
    } else {
      throw e;
    }
  }
};

const addTokenDefaults = async () => {
  try {
    await prisma.tokenSettings.create({
      data: {
        tokenType: ACCESS_TOKEN,
        expiresIn: '1h',
        secret: generatePassword(32),
      },
    });

    await prisma.tokenSettings.create({
      data: {
        tokenType: REFRESH_TOKEN,
        expiresIn: '7d',
        secret: generatePassword(32),
      },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;
    if (e.code === 'P2002') {
      console.log('Token setings already exist');
      return;
    } else {
      throw e;
    }
  }
};

const load = async () => {
  try {
    await addRoles();
    await addDomainAdminUser();
    await addTokenDefaults();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
