import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormDefinitionDto } from '../models/form-generator.mode';

@Injectable({ providedIn: 'root' })
export class FormsApiService {
  private readonly baseUrl = 'https://localhost:7169/api/forms';

  constructor(private http: HttpClient) {}

  createForm(form: FormDefinitionDto): Observable<FormDefinitionDto> {
    return this.http.post<FormDefinitionDto>(this.baseUrl, form);
  }

  getForms(): Observable<FormDefinitionDto[]> {
    return this.http.get<FormDefinitionDto[]>(this.baseUrl);
  }

  getFormById(id: string): Observable<FormDefinitionDto> {
    return this.http.get<FormDefinitionDto>(`${this.baseUrl}/${id}`);
  }
}
