import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, takeUntil } from 'rxjs';

import {
  CreateFormDefinitionRequest,
  FormDefinition,
  FormSubmission,
  CreateFormSubmissionRequest,
  UpdateFormSubmissionRequest,
  SendForSignatureRequest,
  SignSubmissionRequest,
  SignatureRequest,
  ResolveSubmissionAccessRequest,
  ResolveSubmissionAccessResponse,
  UpdateSubmissionByAccessTokenRequest,
  PagedResult,
  ResolveVerifyTokenResponse,
} from '../models/form-generator.mode';

import { environment } from '../../../environments/environment';
import { ToolsService } from './tools.service';
import {
  SubmissionSummaryResponse,
  SubmissionTrendPointResponse,
  SubmissionTrendResponse,
} from '../models/submission-settings.model';

@Injectable({ providedIn: 'root' })
export class FormsApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ---------------------------
  // FORM DEFINITION (templates)
  // ---------------------------

  createForm(form: CreateFormDefinitionRequest): Observable<FormDefinition> {
    return this.http.post<FormDefinition>(`${this.baseUrl}/forms`, form);
  }

  getForms(): Observable<FormDefinition[]> {
    return this.http.get<FormDefinition[]>(`${this.baseUrl}/forms/mine`);
  }

  getFormById(id: string): Observable<FormDefinition> {
    return this.http.get<FormDefinition>(`${this.baseUrl}/forms/${id}`);
  }

  updateForm(id: string, form: FormDefinition): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/forms/${id}`, form);
  }

  deleteForm(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/forms/${id}`);
  }

  // ---------------------------
  // FORM SUBMISSIONS (filled forms)
  // ---------------------------

  createSubmission(request: CreateFormSubmissionRequest): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(`${this.baseUrl}/submissions`, request);
  }

  getSubmissions(
    search?: string,
    page: number = 1,
    pageSize: number = 20,
    sortField?: string,
    sortDir?: 'asc' | 'desc',
  ): Observable<PagedResult<FormSubmission>> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (sortField) {
      params = params.set('sortField', sortField);
    }

    if (sortDir) {
      params = params.set('sortDir', sortDir);
    }

    return this.http.get<PagedResult<FormSubmission>>(`${this.baseUrl}/submissions/mine`, {
      params,
    });
  }

  getSubmissionById(
    id: string,
    accessToken?: string,
    verifyToken?: string,
  ): Observable<FormSubmission> {
    let url = `${this.baseUrl}/submissions/${id}`;
    const params: string[] = [];

    if (accessToken) {
      params.push(`accessToken=${encodeURIComponent(accessToken)}`);
    }

    if (verifyToken) {
      params.push(`verifyToken=${encodeURIComponent(verifyToken)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<FormSubmission>(url);
  }

  getSubmissionsSummary(
    start: string | null,
    end: string | null,
  ): Observable<SubmissionSummaryResponse<FormSubmission>> {
    let params = new HttpParams();

    console.log('start', start);

    if (start) {
      params = params.set('start', start);
    }

    if (end) {
      params = params.set('end', end);
    }

    console.log('keys', params.keys());
    console.log('params string', params.toString());

    return this.http.get<SubmissionSummaryResponse<FormSubmission>>(
      `${this.baseUrl}/submissions/mine/summary`,
      {
        params,
      },
    );
  }

  getSubmissionsTrend(
    start: string | null,
    end: string | null,
  ): Observable<SubmissionTrendResponse> {
    let params = new HttpParams();

    if (start) {
      params = params.set('start', start);
    }

    if (end) {
      params = params.set('end', end);
    }

    return this.http.get<SubmissionTrendResponse>(`${this.baseUrl}/submissions/mine/trend`, {
      params,
    });
  }

  resolveverificationPdfAccess(verifyToken: string): Observable<ResolveVerifyTokenResponse> {
    return this.http.get<ResolveVerifyTokenResponse>(
      `${this.baseUrl}/submissions/verification-pdf-access?verifyToken=${encodeURIComponent(verifyToken)}`,
    );
  }

  resolveSubmissionAccess(
    request: ResolveSubmissionAccessRequest,
  ): Observable<ResolveSubmissionAccessResponse> {
    return this.http.post<ResolveSubmissionAccessResponse>(
      `${this.baseUrl}/submissions/access/resolve`,
      request,
    );
  }

  updateSubmission(id: string, request: UpdateFormSubmissionRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/submissions/${id}`, request);
  }

  cancelSubmission(submissionId: string) {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/submissions/${submissionId}/cancel`,
      {},
    );
  }

  updateSubmissionByAccessToken(
    submissionId: string,
    request: UpdateSubmissionByAccessTokenRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/submissions/access/${submissionId}`, request);
  }

  // ---------------------------
  // SIGNATURE WORKFLOW
  // ---------------------------

  sendForSignature(
    submissionId: string,
    request: SendForSignatureRequest,
  ): Observable<SignatureRequest> {
    return this.http.post<SignatureRequest>(
      `${this.baseUrl}/submissions/${submissionId}/send-for-signature`,
      request,
    );
  }

  getSignatureRequest(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/signature-requests/${token}`);
  }

  signSubmission(token: string, request: SignSubmissionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/signature-requests/${token}/sign`, request);
  }

  uploadSignature(file: File, accessToken?: string): Observable<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    let requestUrl = `${this.baseUrl}/uploads/signature`;

    if (accessToken) {
      requestUrl += `?accessToken=${encodeURIComponent(accessToken)}`;
    }

    return this.http.post<{ fileName: string; url: string }>(requestUrl, formData);
  }

  downloadSubmissionPdf(submissionId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/submissions/${submissionId}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadSubmissionPdfByAccessToken(submissionId: string, token: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/submissions/access/${submissionId}/pdf`, {
      params: { token },
      responseType: 'blob',
    });
  }

  downloadPdf(submissionId: string, token: string, toolsService: ToolsService): void {
    if (token) {
      this.downloadSubmissionPdfByAccessToken(submissionId, token)
        .pipe()
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `submission-${submissionId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: () => {
            toolsService.showSnackbar('PDF could not be downloaded.', 'error-snackbar');
          },
        });
    } else {
      this.downloadSubmissionPdf(submissionId)
        .pipe()
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `submission-${submissionId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: () => {
            toolsService.showSnackbar('PDF could not be downloaded.', 'error-snackbar');
          },
        });
    }
  }
}
