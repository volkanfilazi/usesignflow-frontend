export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface MeDto {
  email: string;
  fullName: string;
  twoFactorEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ResetPassword {
  email: string;
  token: string;
  NewPassword: string;
}

export interface AuthResponse {
  token: string;
  tokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  email: string;
  fullName: string;
  requiresTwoFactor: boolean;
  twoFactorToken?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  email: string;
  refreshToken: string;
}

export interface TwoFASetupResponse {
  secret: string;
  otpauthUrl: string;
}

export interface EnableNotificationsResponse {
  enabled: boolean;
}

export interface VerifyTwoFactorRequest {
  twoFactorToken: string;
  code: string;
}

export interface TwoFAEnableRequest {
  code: string;
}

export interface DisableTwoFactorRequest {
  CurrentPassword: string;
  Code: string;
}

export interface JwtPayloadModel {
  sub: string;
  email: string;
  name: string;
  exp: number;
  emailVerified: string;
  twoFactorEnabled?: string;
}

export enum EditMode {
  VIEW = 'view',
  EDIT = 'edit',
  CREATE = 'create',
}
