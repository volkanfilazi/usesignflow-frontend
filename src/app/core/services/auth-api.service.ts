import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthResponse,
  ChangePasswordRequest,
  DeleteAccountRequest,
  DisableTwoFactorRequest,
  EnableNotificationsResponse,
  LoginDto,
  MeDto,
  OneTimeCodeResponse,
  RefreshTokenRequest,
  RegisterDto,
  ResetPassword,
  SendOneTimeCodeRequest,
  TwoFAEnableRequest,
  TwoFASetupResponse,
  VerifyOneTimeCodeRequest,
  VerifyOneTimeCodeResponse,
  VerifyTwoFactorRequest,
} from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';
import { GoogleLoginRequest } from '../../shared/models/form-generator.mode';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createRegister(form: RegisterDto): Observable<RegisterDto> {
    return this.http.post<RegisterDto>(`${this.baseUrl}/auth/register`, form);
  }

  me(): Observable<MeDto> {
    return this.http.get<MeDto>(`${this.baseUrl}/auth/me`, {});
  }

  login(form: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, form);
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(reset: ResetPassword): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/reset-password`, reset);
  }

  deleteMyAccount(request: DeleteAccountRequest) {
    return this.http.request<void>('delete', `${this.baseUrl}/auth/me`, {
      body: request,
    });
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    const body: GoogleLoginRequest = {
      credential,
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/google`, body);
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, request);
  }

  resendVerification(email: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/resend-verification`, { email });
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/auth/change/password`, request);
  }

  twoFASetup(): Observable<TwoFASetupResponse> {
    return this.http.post<TwoFASetupResponse>(`${this.baseUrl}/auth/2fa/setup`, {});
  }

  verifyOneTimeCode(request: VerifyOneTimeCodeRequest): Observable<VerifyOneTimeCodeResponse> {
    return this.http.post<VerifyOneTimeCodeResponse>(`${this.baseUrl}/auth/one-time-code/verify`, request);
  }

  sendOneTimeCode(request: SendOneTimeCodeRequest): Observable<OneTimeCodeResponse> {
    return this.http.post<OneTimeCodeResponse>(
      `${this.baseUrl}/auth/one-time-code/send`,
      request,
    );
  }

  enableNotifications(enable: EnableNotificationsResponse): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/auth/notifications`, enable);
  }

  twoFAEnable(request: TwoFAEnableRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/2fa/enable`, request);
  }

  verifyTwoFactor(request: VerifyTwoFactorRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login/2fa`, request);
  }

  disableTwoFactor(request: DisableTwoFactorRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/2fa/disable`, request);
  }
}
