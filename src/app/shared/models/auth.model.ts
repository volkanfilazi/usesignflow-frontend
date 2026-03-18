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
  tokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  email: string;
  fullName: string;
}

export interface RefreshTokenRequest {
  email: string;
  refreshToken: string;
}

export interface JwtPayloadModel {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

export enum EditMode {
  VIEW = 'View',
  EDIT = 'Edit',
  CREATE = 'Create',
}
