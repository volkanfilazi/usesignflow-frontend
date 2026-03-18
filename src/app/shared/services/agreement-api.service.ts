import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AgreementTemplate } from '../models/form-generator.mode';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgreementApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  create(form: AgreementTemplate): Observable<AgreementTemplate> {
    return this.http.post<AgreementTemplate>(`${this.baseUrl}/agreements`, form);
  }

  getAgreements(): Observable<AgreementTemplate[]> {
    return this.http.get<AgreementTemplate[]>(`${this.baseUrl}/agreements`);
  }

  getById(id: string): Observable<AgreementTemplate> {
    return this.http.get<AgreementTemplate>(`${this.baseUrl}/agreements/${id}`);
  }

  update(id: string, form: AgreementTemplate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/agreements/${id}`, form);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/agreements/${id}`);
  }
}
