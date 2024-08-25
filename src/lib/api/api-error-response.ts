import { ZodError } from 'zod';

export class ApiErrorReponse extends Response {
  constructor(error: string | ZodError, status: number) {
    super(JSON.stringify({ error }), {
      headers: { 'Content-Type': 'application/json' },
      status,
    });
  }
}
