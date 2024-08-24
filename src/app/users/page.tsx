import { AddUserForm } from '@/components/add-user-form';
import { apiClient } from '@/lib/api/api-client';

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
      <AddUserForm availableRoles={availableRoles}></AddUserForm>
    </>
  );
}
