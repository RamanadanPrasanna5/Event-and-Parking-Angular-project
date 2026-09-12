export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface AuthResponseDto {
  token: string;
  customerId: string;
  expiresAt?: string;
  customerName?: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  exp: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: 'Admin' | 'Customer';
}
