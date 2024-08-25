import axios, { AxiosError } from 'axios';
import { ZodError } from 'zod';

type ApiErrorData = AxiosError & {
  response: {
    data: {
      error: string | ZodError;
    };
  };
};

export function isApiError(error: unknown): error is ApiErrorData {
  if (!axios.isAxiosError(error)) return false;
  return (
    error.response !== undefined &&
    error.response.data !== undefined &&
    (typeof error.response.data.error === 'string' || error.response.data.error instanceof ZodError)
  );
}
