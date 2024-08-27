import { FC, useEffect, useState } from 'react';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserWithRoleAsArray } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { UserDeleteDialog } from '../user-delete-dialog/user-delete-dialog';

interface UserEditMenuProps {
  user: UserWithRoleAsArray;
}

export const UserEditMenu: FC<UserEditMenuProps> = ({ user }) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Change Email</TableHead>
            <TableHead>Change Password</TableHead>
            <TableHead>Change Role</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.roles.map((r) => capitalizeFirstLetter(r)).join(', ')}</TableCell>
            <TableCell>
              <Button>Update</Button>
            </TableCell>
            <TableCell>
              <Button>Update</Button>
            </TableCell>
            <TableCell>
              <Button>Update</Button>
            </TableCell>
            <TableCell>
              <UserDeleteDialog id={user.id} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};
