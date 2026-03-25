import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BillingApiService } from '../../shared/services/billing-api-service';

export const billingFlowGuard: CanActivateFn = (route, state) => {
  const billingApiService = inject(BillingApiService);
  const router = inject(Router);
  const overview = billingApiService.getOverviewResponse();

  if (!overview) {
    return true;
  }

  if (overview && overview.usage.activeFlowsUsed < overview.entitlements.maxActiveFlows) {
    return true;
  }

  return router.createUrlTree(['dashboard/form-generator-entry'], {
    queryParams: {
      returnUrl: state.url,
      reason: 'flow',
    },
  });
};
