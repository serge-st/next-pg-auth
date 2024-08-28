'use client'; // Error boundaries must be Client Components

import { isApiError } from '@/lib/api';
import { useEffect } from 'react';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.log(error);
  }, [error]);

  const errorData = isApiError(error) ? error.response.data.error.toString() : 'An error occurred';

  return (
    <>
      <h1 className="w-full text-center text-2xl">Error Fetching User</h1>
      <p className="w-full text-center text-destructive">{errorData}</p>
    </>
  );
}
