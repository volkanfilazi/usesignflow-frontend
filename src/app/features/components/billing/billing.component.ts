import { Component, OnInit } from '@angular/core';
import { BillingOverviewResponse, PlanCode } from '../../../shared/models/payment.model';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../shared/components/dialogs/delete-dialog/delete-dialog.component';
import { ToolsService } from '../../../shared/services/tools.service';
import { plans } from '../../models/billing.model';

type UsageCard = {
  key: 'forms' | 'submissions' | 'emails' | 'pdf';
  title: string;
  usedLabel: string;
  helperText: string;
  progress: number;
  isWarning: boolean;
  isLocked: boolean;
};

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  standalone: false,
})
export class BillingComponent implements OnInit {
  billingOverviewResponse: BillingOverviewResponse | null = null;

  loading = false;
  checkoutLoading$ = new BehaviorSubject(false);
  errorMessage = '';
  plans = plans;

  constructor(
    private readonly billingApi: BillingApiService,
    private readonly matDialog: MatDialog,
    private readonly toolsService: ToolsService,
  ) {}

  ngOnInit(): void {
    this.loadOverview();

    window.addEventListener('pageshow', (event: any) => {
    if (event.persisted) {
      this.checkoutLoading$.next(false);
    }
  });
  }

  loadOverview(): void {
    this.loading = true;
    this.errorMessage = '';

    this.billingApi.getOverview().subscribe({
      next: (response) => {
        this.billingOverviewResponse = response;
        this.billingApi.setOverviewResponse(response);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load billing overview.';
        this.loading = false;
      },
    });
  }

  selectPlan(planCode: PlanCode) {
    const current = this.billingOverviewResponse?.planCode;

    if (current === planCode) return;

    if (current === 'Free') {
      this.startCheckout(planCode);

      return;
    }

    this.changePlan(planCode);
  }

  changePlan(planCode: PlanCode) {
    if (this.isCurrentPlan(planCode)) return;

    this.checkoutLoading$.next(true);
    this.errorMessage = '';

    this.billingApi.createChangePlan(planCode).subscribe({
      next: (response) => {
        this.loadOverview();
        this.checkoutLoading$.next(false);
      },
      error: () => {
        this.errorMessage = 'Failed to start change plan.';
        this.checkoutLoading$.next(false);
      },
    });
  }

  startCheckout(planCode: PlanCode): void {
    if (this.isCurrentPlan(planCode)) return;

    this.checkoutLoading$.next(true);
    this.errorMessage = '';

    this.billingApi.createCheckout(planCode).subscribe({
      
      next: (response) => {
        console.log(response.checkoutUrl);
        window.location.href = response.checkoutUrl;
      },
      error: () => {
        this.errorMessage = 'Failed to start checkout.';
        this.checkoutLoading$.next(false);
      }
    });
  }

  cancelSubscription() {
    this.checkoutLoading$.next(true);
    this.errorMessage = '';
    const dialogRef = this.matDialog.open(DeleteDialogComponent, {
      data: {
        title: 'Cancel Plan',
        description:
          'Your subscription will be cancelled. You will not be charged in the next billing cycle.',
        icon: 'warning',
        needReason: false,
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm === '') {
        this.billingApi.cancelRenewal().subscribe({
          next: () => {
            this.loadOverview();
            this.checkoutLoading$.next(false);
            this.toolsService.showSnackbar(
              'Your plan has been successfully canceled',
              'success-message',
            );
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Failed to cancel subscription.';
            this.checkoutLoading$.next(false);
          },
        });
      } else {
        this.checkoutLoading$.next(false);
      }
    });
  }

  reactivateSubscription() {
    this.checkoutLoading$.next(true);
    this.billingApi.reactivateRenewal().subscribe({
      next: () => {
        this.loadOverview();
        this.checkoutLoading$.next(false);
        this.toolsService.showSnackbar(
          'Your plan has been successfully reactivated.',
          'success-message',
        );
      },
      error: () => {
        this.checkoutLoading$.next(false);
        this.errorMessage = 'Failed to reactivate subscription.';
      },
    });
  }

  planOrder(plan: PlanCode | undefined): number {
    switch (plan) {
      case 'Free':
        return 0;
      case 'Pro':
        return 1;
      case 'Business':
        return 2;
      default:
        return 0;
    }
  }

  isCurrentPlan(plan: PlanCode): boolean {
    return this.billingOverviewResponse?.planCode === plan;
  }

  isUpgrade(plan: PlanCode): boolean {
    return this.planOrder(plan) > this.planOrder(this.billingOverviewResponse?.planCode);
  }

  isDowngrade(plan: PlanCode): boolean {
    return this.planOrder(plan) < this.planOrder(this.billingOverviewResponse?.planCode);
  }

  get usageCards(): UsageCard[] {
    const overview = this.billingOverviewResponse;
    if (!overview) return [];

    const { usage, entitlements } = overview;

    return [
      {
        key: 'forms',
        title: 'Forms created',
        usedLabel: `${usage.activeFlowsUsed} / ${entitlements.maxActiveFlows}`,
        helperText: this.buildRemainingText(
          entitlements.maxActiveFlows - usage.activeFlowsUsed,
          'flow',
          'You have reached your active flow limit.',
        ),
        progress: this.getProgressPercent(usage.activeFlowsUsed, entitlements.maxActiveFlows),
        isWarning: this.isNearLimit(usage.activeFlowsUsed, entitlements.maxActiveFlows),
        isLocked: false,
      },
      {
        key: 'submissions',
        title: 'Submissions',
        usedLabel: `${usage.submissionsUsedThisMonth} / ${entitlements.maxSubmissionsPerMonth}`,
        helperText: this.buildRemainingText(
          entitlements.maxSubmissionsPerMonth - usage.submissionsUsedThisMonth,
          'submission',
          'You have reached your monthly submission limit.',
        ),
        progress: this.getProgressPercent(
          usage.submissionsUsedThisMonth,
          entitlements.maxSubmissionsPerMonth,
        ),
        isWarning: this.isNearLimit(
          usage.submissionsUsedThisMonth,
          entitlements.maxSubmissionsPerMonth,
        ),
        isLocked: false,
      },
      {
        key: 'pdf',
        title: 'PDF exports',
        usedLabel: entitlements.canExportPdf
          ? entitlements.maxExportPdfPerMonth > 0
            ? `${usage.pdfExportsUsedThisMonth} / ${entitlements.maxExportPdfPerMonth}`
            : 'Unlimited'
          : 'Locked',
        helperText: entitlements.canExportPdf
          ? entitlements.maxExportPdfPerMonth > 0
            ? this.buildRemainingText(
                entitlements.maxExportPdfPerMonth - usage.pdfExportsUsedThisMonth,
                'PDF export',
                'You have reached your monthly PDF export limit.',
              )
            : 'Export completed forms as PDF files without a fixed monthly cap.'
          : 'Upgrade to Pro to export completed forms as PDF files.',
        progress:
          entitlements.canExportPdf && entitlements.maxExportPdfPerMonth > 0
            ? this.getProgressPercent(
                usage.pdfExportsUsedThisMonth,
                entitlements.maxExportPdfPerMonth,
              )
            : 0,
        isWarning:
          entitlements.canExportPdf && entitlements.maxExportPdfPerMonth > 0
            ? this.isNearLimit(usage.pdfExportsUsedThisMonth, entitlements.maxExportPdfPerMonth)
            : false,
        isLocked: !entitlements.canExportPdf,
      },
      {
        key: 'emails',
        title: 'Email sends',
        usedLabel: entitlements.canSendEmail
          ? `${usage.emailsUsedThisMonth} / ${entitlements.maxEmailPerMonth}`
          : 'Locked',
        helperText: entitlements.canSendEmail
          ? this.buildRemainingText(
              entitlements.maxEmailPerMonth - usage.emailsUsedThisMonth,
              'email',
              'You have reached your monthly email limit.',
            )
          : 'Upgrade your plan to send emails from SignFlow.',
        progress: entitlements.canSendEmail
          ? this.getProgressPercent(usage.emailsUsedThisMonth, entitlements.maxEmailPerMonth)
          : 0,
        isWarning: entitlements.canSendEmail
          ? this.isNearLimit(usage.emailsUsedThisMonth, entitlements.maxEmailPerMonth)
          : false,
        isLocked: !entitlements.canSendEmail,
      },
    ];
  }

  private getProgressPercent(used: number, limit: number): number {
    if (!limit || limit <= 0) return 0;
    const percent = (used / limit) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
  }

  private isNearLimit(used: number, limit: number): boolean {
    if (!limit || limit <= 0) return false;
    return used / limit >= 0.8;
  }

  private buildRemainingText(remaining: number, noun: string, fallback: string): string {
    if (remaining <= 0) return fallback;
    const suffix = remaining === 1 ? noun : `${noun}s`;
    return `You can still use ${remaining} more ${suffix} on this plan.`;
  }
}
