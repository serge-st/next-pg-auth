import { PageLoading } from '@/components/page-loading';
import { apiClient, isRouteAllowed } from '@/lib/api';
import { APP_ROUTES } from '@/lib/constants';
import { ValidateResponse } from '@/lib/types';
import { localStorageAccessToken } from '@/lib/utils/helpers';
import { useMutation } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Roles } from '@/lib/types';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const pathname = usePathname();
    const { mutate, isPending, error, isSuccess, data } = useMutation({
      mutationFn: (token: string) => {
        return apiClient
          .post<ValidateResponse>(
            '/auth/validate',
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          )
          .then((res) => res.data);
      },
    });

    useEffect(() => {
      const token = localStorageAccessToken.get();
      if (!token) redirect('/');

      mutate(token);
    }, [mutate]);

    useEffect(() => {
      if (isSuccess) {
        const newToken = data.access_token;
        if (newToken) localStorageAccessToken.set(newToken);
        const [role] = data.payload?.roles;

        if (!role) redirect('/');
        const allowedRoutes = APP_ROUTES[role as Roles];

        if (!isRouteAllowed(pathname, allowedRoutes)) redirect('/');
      }
    }, [data, pathname, isSuccess]);

    if (error) redirect('/');

    if (isPending) return <PageLoading />;

    return <WrappedComponent {...props} />;
  };
}
