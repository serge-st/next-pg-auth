import { AddUserForm } from '@/components/add-user-form';
import { apiClient } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UsersTable } from '@/components/users-table';

const fetchUsers = async () => {
  const result = await apiClient.get('/users');
  return result.data;
};

const fetchRoles = async () => {
  const result = await apiClient.get('/roles', {
    params: { names_only: true },
  });
  return result.data;
};

export default async function UsersPage() {
  const availableRoles = await fetchRoles();
  const users = await fetchUsers();

  return (
    <>
      <h1 className="w-full text-center text-2xl">User Management</h1>
      <Tabs defaultValue="list" className="flex w-full flex-col items-center gap-4">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="list">User List</TabsTrigger>
          <TabsTrigger value="form">Add User</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <UsersTable users={users}></UsersTable>
        </TabsContent>
        <TabsContent value="form">
          <AddUserForm availableRoles={availableRoles}></AddUserForm>
        </TabsContent>
      </Tabs>
    </>
  );
}
