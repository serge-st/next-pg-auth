import { RoleRoutes } from '../types';

export const API_ROUTES: RoleRoutes = {
  admin: [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/logout/[id]',
    '/api/auth/validate',
    '/api/roles',
    '/api/users',
    '/api/users/[id]',
  ],
  user: ['/api/auth/login', '/api/auth/logout', '/api/auth/validate'],
} as const;
