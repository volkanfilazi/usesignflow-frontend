import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormDefinitionDto } from '../models/form-generator.mode';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormsApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createForm(form: FormDefinitionDto): Observable<FormDefinitionDto> {
    return this.http.post<FormDefinitionDto>(`${this.baseUrl}/forms`, form);
  }

  getForms(): Observable<FormDefinitionDto[]> {
    return this.http.get<FormDefinitionDto[]>(`${this.baseUrl}/forms/mine`);
  }

  getFormById(id: string): Observable<FormDefinitionDto> {
    return this.http.get<FormDefinitionDto>(`${this.baseUrl}/forms/${id}`);
  }
}
