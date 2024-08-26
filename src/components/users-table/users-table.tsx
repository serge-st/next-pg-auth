'use client';

import { FC } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserWithRoleAsArray } from '@/lib/types/user-with-role-as-array';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import Link from 'next/link';
import { Button } from '../ui';

interface UsersTableProps {
  users: UserWithRoleAsArray[];
}

export const UsersTable: FC<UsersTableProps> = ({ users }) => {
  console.log(users);
  return (
    <Table>
      <TableCaption>A list of app users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-center">Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.roles.map((r) => capitalizeFirstLetter(r)).join(', ')}</TableCell>
            <TableCell>
              <Button asChild variant="link">
                <Link href={`/users/${user.id}`}>Edit user</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
