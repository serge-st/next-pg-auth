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
import { UserWithRoleAsArray } from '@/lib/types';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UsersTableProps {
  users: UserWithRoleAsArray[];
}

export const UsersTable: FC<UsersTableProps> = ({ users }) => {
  return (
    <Table>
      <TableCaption>All app users.</TableCaption>
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
