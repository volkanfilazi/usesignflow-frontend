import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LegalApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCurrentTerm() {
    return this.http.get(`${this.baseUrl}/legal/terms/current`, { responseType: 'text' });
  }

  getCurrentPrivacy() {
    return this.http.get(`${this.baseUrl}/legal/privacy/current`, { responseType: 'text' });
  }
}
