import { Prisma } from '@prisma/client';

export type UserWithRoles = Prisma.UserGetPayload<{
  omit: {
    password: true;
  };
  include: {
    roles: {
      select: {
        name: true;
      };
    };
  };
}>;
