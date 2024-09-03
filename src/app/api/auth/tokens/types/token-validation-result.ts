type TokenValidationStatus = 'expired' | 'error';

export type TokenValidationResult =
  | { status: 'success'; payload: any }
  | { status: TokenValidationStatus };
