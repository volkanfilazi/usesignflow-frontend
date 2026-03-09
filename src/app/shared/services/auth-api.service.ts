import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterDto } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly registerUrl = 'https://localhost:7169/api/auth/register';
  private readonly loginUrl = 'https://localhost:7169/api/auth/login';

  constructor(private http: HttpClient) {}

  createRegister(form: RegisterDto): Observable<RegisterDto> {
    return this.http.post<RegisterDto>(this.registerUrl, form);
  }
}
