export class ApiResponse<T = any> extends Response {
  constructor(data: T, status: number) {
    super(data && JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status,
    });
  }
}
