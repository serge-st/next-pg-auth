'use client';

import { FC } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export const LogoutButton: FC = () => {
  const router = useRouter();
  const { mutate, isSuccess } = useMutation({
    mutationFn: () => {
      return apiClient.post('/auth/logout', {});
    },
  });
  const handleLogout = () => {
    console.log('logout');
    // mutate();
    // delete access token
    router.push('/');
  };
  return (
    <Button onClick={handleLogout} variant="secondary">
      Logout
    </Button>
  );
};
