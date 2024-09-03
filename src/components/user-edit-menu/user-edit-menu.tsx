'use client';

import { FC, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiClient, isApiError } from '@/lib/api';
import { useToast } from '../ui/use-toast';

interface UserEditMenuProps {
  user: UserWithRoleAsArray;
}

export const UserEditMenu: FC<UserEditMenuProps> = ({ user }) => {
  const { toast } = useToast();
  const { mutate, isSuccess } = useMutation({
    mutationFn: () => {
      return apiClient.post(`/auth/logout/${user.id}`, {});
    },
    onError: (error) => {
      const erroMessage = isApiError(error)
        ? error.response.data.error.toString()
        : 'Unexpected error occurred';
      toast({
        title: 'Error',
        description: erroMessage,
      });
    },
  });

  useEffect(() => {
    if (!isSuccess) return;
    toast({
      title: 'Success',
      description: `Session ended for User ID: ${user.id}`,
    });
  }, [isSuccess, toast, user.id]);

  const handleEndSession = () => {
    mutate();
  };

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
            <TableCell className="flex flex-col justify-evenly gap-2 lg:flex-row">
              <EditUserProperty id={user.id} propertyToEdit="email" initialValue={user.email}>
                Change Email
              </EditUserProperty>
              <EditUserProperty id={user.id} propertyToEdit="password">
                Change Password
              </EditUserProperty>
              <EditUserProperty
                id={user.id}
                propertyToEdit="role"
                initialValue={user.roles.join('')}
              >
                Change Role
              </EditUserProperty>
              <Button onClick={handleEndSession}>End Session</Button>
              <UserDeleteDialog id={user.id} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};
