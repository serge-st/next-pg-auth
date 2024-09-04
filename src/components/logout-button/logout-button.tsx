'use client';

import { FC } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { localStorageAccessToken } from '@/lib/utils/helpers';

export const LogoutButton: FC = () => {
  const router = useRouter();
  const { mutate } = useMutation({
    mutationFn: () => {
      return apiClient.post('/auth/logout', {});
    },
  });
  const handleLogout = () => {
    console.log('logout');
    mutate();
    localStorageAccessToken.remove();
    router.push('/');
  };
  return (
    <Button onClick={handleLogout} variant="secondary">
      Logout
    </Button>
  );
};
