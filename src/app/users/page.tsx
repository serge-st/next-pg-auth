import { AddUserForm } from '@/components/add-user-form';
import { apiClient } from '@/lib/api/api-client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
      <Tabs defaultValue="list" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">User List</TabsTrigger>
          <TabsTrigger value="form">Add User</TabsTrigger>
        </TabsList>
        <TabsContent value="list">Make changes to your account here.</TabsContent>
        <TabsContent value="form">
          <AddUserForm availableRoles={availableRoles}></AddUserForm>
        </TabsContent>
      </Tabs>
    </>
  );
}
