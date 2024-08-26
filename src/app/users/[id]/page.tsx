'use client';

import { apiClient } from '@/lib/api/api-client';
import { useQuery } from '@tanstack/react-query';
import { NextPage } from 'next';
import LoadingPage from '../loading';
import { FC } from 'react';
import { isApiError } from '@/lib/api/is-api-error';
import { UserWithRoleAsArray } from '@/lib/types/user-with-role-as-array';

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserError: FC<{ error: unknown }> = ({ error }) => {
  const errorData = isApiError(error) ? error.response.data.error.toString() : 'An error occurred';
  return (
    <>
      <h1 className="w-full text-center text-2xl">Error Fetching User</h1>
      <p className="w-full text-center text-red-500">{errorData}</p>
    </>
  );
};

const UserPage: NextPage<UserPageProps> = ({ params: { id } }) => {
  const { isPending, error, data } = useQuery<UserWithRoleAsArray>({
    queryKey: ['userData', id],
    queryFn: () => apiClient.get(`/users/${id}`).then((res) => res.data),
    retry: 1,
  });

  if (error) return <UserError error={error} />;

  if (isPending) return <LoadingPage />;

  console.log(data);

  return (
    <>
      <h1 className="w-full text-center text-2xl">Edit User Details</h1>
      {/* user details including timestamps */}
      {/* allow to change user details */}
      {/* allow to delete user */}
    </>
  );
};

export default UserPage;
