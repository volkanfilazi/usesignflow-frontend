import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  BillingOverviewResponse,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  PlanCode,
} from '../models/payment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/billing`;
  private overviewResponse = new BehaviorSubject<BillingOverviewResponse | null>(null);

  getOverviewResponse() {
    return this.overviewResponse?.value;
  }

  getBilling(): Observable<BillingOverviewResponse | null> {
    return this.overviewResponse.asObservable();
  }

  setOverviewResponse(value: BillingOverviewResponse) {
    this.overviewResponse.next(value);
  }

  clearOverviewCache() {
    this.overviewResponse.next(null);
  }

  getOverview(): Observable<BillingOverviewResponse> {
    return this.http.get<BillingOverviewResponse>(`${this.baseUrl}/overview`);
  }

  createCheckout(planCode: PlanCode): Observable<CreateCheckoutResponse> {
    const body: CreateCheckoutRequest = { planCode };

    return this.http.post<CreateCheckoutResponse>(`${this.baseUrl}/checkout`, body);
  }

  createChangePlan(planCode: PlanCode): Observable<CreateCheckoutResponse> {
    const body: CreateCheckoutRequest = { planCode };

    return this.http.post<CreateCheckoutResponse>(`${this.baseUrl}/change-plan`, body);
  }

  cancelRenewal(): Observable<any> {
    return this.http.post(`${this.baseUrl}/cancel-renewal`, {});
  }

  reactivateRenewal(): Observable<any> {
    return this.http.post(`${this.baseUrl}/reactivate-renewal`, {});
  }

  loadOverview() {
    this.getOverview().subscribe({
      next: (response) => {
        this.overviewResponse?.next(response);
      },
      error: () => {},
    });
  }
}
