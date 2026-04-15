import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  SubmissionSettingsResponse,
  SubmissionSettingsUpdate,
} from '../models/submission-settings.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubmissionSettingsApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getSetting(): Observable<SubmissionSettingsResponse> {
    return this.http.get<SubmissionSettingsResponse>(`${this.baseUrl}/submissions/settings/me`);
  }

  updateSubmissionSetting(form: SubmissionSettingsUpdate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/submissions/settings/setting`, form);
  }
}
