'use client';

import { useQuery } from '@tanstack/react-query';
import LoadingPage from '../loading';
import { createContext } from 'react';
import { apiClient } from '@/lib/api';
import { UserWithRoleAsArray } from '@/lib/types';
import { NextPage } from 'next';
import { UserEditMenu } from '@/components/user-edit-menu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export const UserPageContext = createContext({ refetch: () => {} });

interface UserPageProps {
  params: {
    id: string;
  };
}

const UserPage: NextPage<UserPageProps> = ({ params: { id } }) => {
  const { isPending, error, data, isSuccess, refetch } = useQuery<UserWithRoleAsArray>({
    queryKey: ['userData', id],
    queryFn: () => {
      console.log(`${Math.random()} /users/${id} fetching...`);
      return apiClient.get<UserWithRoleAsArray>(`/users/${id}`).then((res) => res.data);
    },
    retry: 1,
  });

  if (error) throw error;

  if (isPending) return <LoadingPage />;

  return (
    <UserPageContext.Provider value={{ refetch }}>
      <h1 className="w-full text-center text-2xl">Edit User Details</h1>
      {isSuccess && <UserEditMenu user={data} />}
      <Button asChild variant="secondary" className="mt-12">
        <Link href="/users">Go Back</Link>
      </Button>
    </UserPageContext.Provider>
  );
};

export default UserPage;
