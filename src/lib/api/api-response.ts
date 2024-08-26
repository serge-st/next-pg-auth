export class ApiResponse extends Response {
  constructor(data: any, status: number) {
    super(data && JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status,
    });
  }
}
