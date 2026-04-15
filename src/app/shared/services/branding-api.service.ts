import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/pdf-branding`;

  getBranding(): Observable<PdfBrandingForm> {
    return this.http.get<PdfBrandingForm>(`${this.baseUrl}`);
  }

  updateBranding(request: PdfBrandingForm): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}`, request);
  }
}
