'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FC, useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage: FC<ErrorPageProps> = ({ error, reset }) => {
  const router = useRouter();

  const handleGoBack = () => router.push('/');

  useEffect(() => {
    console.log('msg', error.message);
  }, [error.message]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-8 text-sm">
        <div>
          <h1 className="w-full text-center text-lg text-destructive">An Error Occured</h1>
          {error.message && <p className="text-center text-sm text-gray-500">{error.message}</p>}
        </div>

        <div className="flex gap-8">
          <Button onClick={handleGoBack} variant="default">
            Go Back
          </Button>
          <Button onClick={reset} variant="destructive">
            Reset
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
