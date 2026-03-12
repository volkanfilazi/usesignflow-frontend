import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CreateFormDefinitionRequest,
  FormDefinition,
  FormSubmission,
  CreateFormSubmissionRequest,
  UpdateFormSubmissionRequest,
  SendForSignatureRequest,
  SignSubmissionRequest,
  SignatureRequest,
} from '../models/form-generator.mode';

import { environment } from '../../../environments/environment';

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
    return this.http.post<FormSubmission>(`${this.baseUrl}/form-submissions`, request);
  }

  getSubmissionById(id: string): Observable<FormSubmission> {
    return this.http.get<FormSubmission>(`${this.baseUrl}/form-submissions/${id}`);
  }

  updateSubmission(id: string, request: UpdateFormSubmissionRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/form-submissions/${id}`, request);
  }

  // ---------------------------
  // SIGNATURE WORKFLOW
  // ---------------------------

  sendForSignature(
    submissionId: string,
    request: SendForSignatureRequest,
  ): Observable<SignatureRequest> {
    return this.http.post<SignatureRequest>(
      `${this.baseUrl}/form-submissions/${submissionId}/send-for-signature`,
      request,
    );
  }

  getSignatureRequest(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/signature-requests/${token}`);
  }

  signSubmission(token: string, request: SignSubmissionRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/signature-requests/${token}/sign`, request);
  }

  uploadSignature(file: File): Observable<{ fileName: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ fileName: string; url: string }>(
      `${this.baseUrl}/uploads/signature`,
      formData,
    );
  }
}
