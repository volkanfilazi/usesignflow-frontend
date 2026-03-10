export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}
