'use client';

import { FC } from 'react';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/components/ui/table';
import { UserWithRoleAsArray } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { UserDeleteDialog } from '../user-delete-dialog/user-delete-dialog';
import { EditUserProperty } from '../edit-user-property';

interface UserEditMenuProps {
  user: UserWithRoleAsArray;
}

export const UserEditMenu: FC<UserEditMenuProps> = ({ user }) => {
  return (
    <>
      <Table className="mx-auto max-w-5xl">
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">Controls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.roles.map((r) => capitalizeFirstLetter(r)).join(', ')}</TableCell>
            <TableCell className="flex flex-col justify-between gap-2 lg:flex-row">
              <EditUserProperty id={user.id} propertyToEdit="email" initialValue={user.email}>
                Change Email
              </EditUserProperty>
              <EditUserProperty id={user.id} propertyToEdit="password">
                Change Password
              </EditUserProperty>
              {/* <EditUserProperty id={user.id} propertyToEdit="email" initialValue={user.email}> */}
              {/* 
              <EditUserProperty
                id={user.id}
                propertyToEdit="role"
                initialValue={user.roles.join('')}
              >
                Change Role
              </EditUserProperty>
               */}
              <UserDeleteDialog id={user.id} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};
