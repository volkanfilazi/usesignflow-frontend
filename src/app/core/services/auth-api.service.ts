import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto } from '../../shared/models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createRegister(form: RegisterDto): Observable<RegisterDto> {
    return this.http.post<RegisterDto>(`${this.baseUrl}/auth/register`, form);
  }

  login(form: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, form);
  }
}
