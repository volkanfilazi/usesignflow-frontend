import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailLog } from '../models/email.model';

@Injectable({
  providedIn: 'root',
})
export class EmailApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/emails`;

  getEmails(): Observable<EmailLog[]> {
    return this.http.get<EmailLog[]>(`${this.baseUrl}/mine`);
  }
}
