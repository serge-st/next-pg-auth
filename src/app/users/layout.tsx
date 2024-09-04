'use client';

import { LogoutButton } from '@/components/logout-button/logout-button';
import { localStorageAccessToken } from '@/lib/utils/helpers';

export default function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {localStorageAccessToken.get() && (
        <header className="flex h-14 w-full items-center justify-end p-4">
          <LogoutButton />
        </header>
      )}
      <main className="flex flex-auto flex-col items-center justify-start gap-4 px-24 pb-24 pt-10">
        {children}
      </main>
    </div>
  );
}
