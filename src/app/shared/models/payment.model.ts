export type PlanCode = 'Free' | 'Pro' | 'Business';

export type BillingStatus = 'Inactive' | 'Active' | 'Cancelled' | 'Expired' | 'PastDue' | 'Paused';

export interface BillingOverviewResponse {
  planCode: PlanCode;
  status: BillingStatus;
  currentPeriodEndUtc: string | null;
  cancelAtPeriodEnd: boolean;

  entitlements: {
    maxActiveFlows: number;
    maxSubmissionsPerMonth: number;
    maxEmailPerMonth: number;
    maxExportPdfPerMonth: number;

    canSendEmail: boolean;
    canExportPdf: boolean;
    canRemoveBranding: boolean;
  };

  usage: {
    activeFlowsUsed: number;
    submissionsUsedThisMonth: number;
    emailsUsedThisMonth: number;
    pdfExportsUsedThisMonth: number;
  };
}

export interface CreateCheckoutRequest {
  planCode: PlanCode;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}
