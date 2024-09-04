import { Roles } from './roles';

export type RoleRoutes = {
  [K in Roles]: string[];
};
