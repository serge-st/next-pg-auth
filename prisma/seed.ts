import { ROLES } from './data';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const addRoles = async () => {
    const roles = await prisma.role.findMany();
    const existingRoleNames = new Set(roles.map(r => r.name));

    const rolesToAdd = ROLES.filter(role => !existingRoleNames.has(role));

    if (rolesToAdd.length === 0) return;

    for (const role of rolesToAdd) {
        await prisma.role.create({
            data: {
                name: role,
            }
        })
    }
};

const load = async () => {
    try {
        await addRoles();
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

load();
