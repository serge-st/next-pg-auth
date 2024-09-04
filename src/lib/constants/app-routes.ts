import { RoleRoutes } from '../types';

export const APP_ROUTES: RoleRoutes = {
  admin: ['/', '/users', '/users/[id]'],
  user: ['/'],
} as const;
