import { apiClient } from '@/lib/api/api-client';

const fetchUsers = async () => {
  const result = await apiClient.get('/users');
  return result.data;
};

export default async function UsersPage() {
  const users = await fetchUsers();
  console.log(users);

  return (
    <>
      <h1 className="w-full text-center text-lg">User Management</h1>
    </>
  );
}
