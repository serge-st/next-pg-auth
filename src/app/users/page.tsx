'use client';

import { AddUserForm } from '@/components/add-user-form';
import { apiClient } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UsersTable } from '@/components/users-table';
import { UserWithRoleAsArray } from '@/lib/types';
import { useQueries } from '@tanstack/react-query';
import { PageLoading } from '@/components/page-loading';
import { withAuth } from '@/hooks';
import { UsersPageContext } from './page-context';

const fetchUsers = async () => {
  const result = await apiClient.get<UserWithRoleAsArray[]>('/users');
  return result.data;
};

const fetchRoles = async () => {
  const result = await apiClient.get('/roles', {
    params: { names_only: true },
  });
  return result.data;
};

function UsersPage() {
  const [usersQuery, rolesQuery] = useQueries({
    queries: [
      {
        queryKey: ['userData'],
        queryFn: fetchUsers,
        retry: 1,
      },
      {
        queryKey: ['roles'],
        queryFn: fetchRoles,
        retry: 1,
      },
    ],
  });

  if (usersQuery.error || rolesQuery.error) {
    throw usersQuery.error || rolesQuery.error;
  }

  if (usersQuery.isPaused || rolesQuery.isPending) return <PageLoading />;

  return (
    <UsersPageContext.Provider value={{ refetchUsers: usersQuery.refetch }}>
      <h1 className="w-full text-center text-2xl">User Management</h1>
      <Tabs defaultValue="list" className="flex w-full flex-col items-center gap-4">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="list">User List</TabsTrigger>
          <TabsTrigger value="form">Add User</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          {usersQuery.isSuccess && <UsersTable users={usersQuery.data}></UsersTable>}
        </TabsContent>
        <TabsContent value="form">
          {rolesQuery.isSuccess && <AddUserForm availableRoles={rolesQuery.data}></AddUserForm>}
        </TabsContent>
      </Tabs>
    </UsersPageContext.Provider>
  );
}

export default withAuth(UsersPage);
