import { Component } from '@angular/core';
import { FormsApiService } from '../../../../shared/services/form-api.service';
import {
  FormSubmission,
  getSubmissionMode,
  getSubmissionStatusColors,
  PagedResult,
  SendForSignatureRequest,
  SubmissionStatus,
} from '../../../../shared/models/form-generator.mode';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  TableCellBadge,
  TableColumnDefinition,
  TableEmptyStateMessage,
} from '../../../../shared/components/table/table.component';
import { Router } from '@angular/router';
import { ToolsService } from '../../../../shared/services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { SendEmailDialogComponent } from '../../../../shared/components/dialogs/send-email-dialog/send-email-dialog.component';
import {
  ConfirmDialogComponent,
  DialogResults,
} from '../../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { BillingApiService } from '../../../../shared/services/billing-api-service';
import { BillingOverviewResponse } from '../../../../shared/models/payment.model';
import { LimitReachedDialogComponent } from '../../../../shared/components/dialogs/limit-reached-dialog/limit-reached-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfReaderDialogComponent } from '../../../../shared/components/dialogs/pdf-reader/pdf-reader.component';
import { PageActionService } from '../../../../shared/services/header/page-action.service';
import { HeaderSearchService } from '../../../../shared/services/header/header-search.service';
import { StatsOverviewCard, TrendChartData } from '../../../../shared/models/graph.model';
import { DateRangeValue } from '../../../../shared/models/date-range-filter.model';
import {
  SubmissionSummaryResponse,
  SubmissionTrendResponse,
} from '../../../../shared/models/submission-settings.model';
import { toIsoDate } from '../../../../shared/utility/helper/date-helper';
import { DateRangeService } from '../../../../shared/services/header/date-range.service';

@Component({
  selector: 'app-submissions',
  styleUrl: './submissions.component.scss',
  templateUrl: './submissions.component.html',
  standalone: false,
})
export class SubmissionsComponent {
  private readonly destroy$ = new Subject<void>();
  private overview: BillingOverviewResponse | null = null;

  dateRange: DateRangeValue = {
    preset: 'last30',
    start: null,
    end: null,
  };
  overviewCards: StatsOverviewCard[] = [];
  trendChartData!: TrendChartData;
  tableEmptyStateMessage: TableEmptyStateMessage | undefined;
  pagination: PagedResult<FormSubmission> | undefined;
  submissions: FormSubmission[] = [];
  loading$ = new BehaviorSubject(true);
  columns: TableColumnDefinition<FormSubmission>[] = [];
  searchTerm = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';
  pageOwner = 'submissions';
  showChart = false;

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly matDialog: MatDialog,
    private readonly billingApiService: BillingApiService,
    private readonly sanitizer: DomSanitizer,
    private readonly pageActionService: PageActionService,
    private readonly headerSearchService: HeaderSearchService,
    private readonly dateRangeService: DateRangeService,
  ) {}

  ngOnInit() {
    this.setActions();
    this.setHeaderSearch();
    this.setEmptyStateMessage();
    this.setupColums();
    this.loadSubmissions();

    this.billingApiService
      .getBilling()
      .pipe(takeUntil(this.destroy$))
      .subscribe((item) => {
        this.overview = item;
        this.setupColums();
      });

    this.headerSearchService.searchChanged$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.searchTerm = value;
      this.loadSubmissions(1, value);
    });

    this.dateRangeService.dateRangeChanged$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      console.log(value);
      this.dateRange = value;
      this.loadSummary();
      this.loadTrend();
    });
  }

  editSubmission(row: FormSubmission): void {
    const mode = getSubmissionMode(row);
    this.router.navigate(['/dashboard/submissions', row.id, mode]);
  }

  onSort(column: string) {
    if (this.sortField === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = column;
      this.sortDir = 'asc';
    }

    this.loadSubmissions(1, this.searchTerm);
  }

  loadSubmissions(page: number = 1, searchValue?: string) {
    if (searchValue !== undefined) {
      this.searchTerm = searchValue;
    }

    this.loading$.next(true);

    this.formApiService
      .getSubmissions(this.searchTerm, page, 20, this.sortField, this.sortDir)
      .subscribe({
        next: (res) => {
          this.submissions = res.items;

          this.pagination = {
            items: res.items,
            pageIndex: res.pageIndex,
            pageSize: res.pageSize,
            totalCount: res.totalCount,
          };

          this.loading$.next(false);
        },
        error: () => {
          this.loading$.next(false);
        },
      });
  }

  private getDefaultRange(): DateRangeValue {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 29);

    return {
      preset: 'last30',
      start: toIsoDate(start),
      end: toIsoDate(now),
    };
  }

  private loadSummary() {
    this.formApiService.getSubmissionsSummary(this.dateRange.start, this.dateRange.end).subscribe({
      next: (response) => {
        this.setupOverViewCards(response);
      },
      error: () => {},
    });
  }

  private loadTrend() {
    this.formApiService.getSubmissionsTrend(this.dateRange.start, this.dateRange.end).subscribe({
      next: (response) => {
        this.setupTrend(response);
      },
      error: () => {},
    });
  }

  onPageChanged(page: number) {
    this.loadSubmissions(page);
  }

  navigteToFormList() {
    this.router.navigate(['/dashboard/forms']);
  }

  onRowClick(row: FormSubmission) {
    const mode = getSubmissionMode(row);
    this.router.navigate(['dashboard/submissions', row.id, mode]);
  }

  private download(row: FormSubmission) {
    if (row.id) {
      this.formApiService
        .downloadSubmissionPdf(row?.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            const isMobile = window.innerWidth <= 480;

            if (isMobile) {
              window.open(url, '_blank');
            } else {
              this.matDialog.open(PdfReaderDialogComponent, {
                width: '500vh',
                height: '90%',
                data: {
                  pdfUrl: pdfUrl,
                },
              });
            }
          },
          error: () => {
            this.toolsService.showSnackbar('PDF could not be downloaded.', 'error-snackbar');
          },
        });
    }
  }

  private cancel(row: FormSubmission): void {
    if (!this.canCancel(row)) {
      this.toolsService.showSnackbar(
        'Completed or expired submissions cannot be canceled.',
        'error-snackbar',
      );

      return;
    }

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '420px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Cancel submission',
        message: 'This will stop the submission process and invalidate external access links.',
        confirmText: 'Cancel submission',
        cancelText: 'Back',
        variant: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: DialogResults) => {
      if (confirmed === DialogResults.save) {
        this.loading$.next(true);

        this.formApiService.cancelSubmission(row.id!).subscribe({
          next: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'Submission cancelled successfully.',
              'success-snackbar',
            );
            this.loadSubmissions();
          },
          error: (error: any) => {
            this.loading$.next(false);
          },
        });
      }
    });
  }

  private setEmptyStateMessage() {
    this.tableEmptyStateMessage = {
      kicker: 'Submission list',
      description: 'You have not created any submission yet. Fill a form and submit it.',
      title: 'No submissions created yet',
      buttonText: 'Create your first submission',
      imageSrc: 'Documents-pana.svg',
      navigationUrl: '/forms',
    };
  }

  private canCancel(row: FormSubmission): boolean {
    return row.status !== 'Completed' && row.status !== 'Cancelled' && row.status !== 'Expired';
  }

  private sendSubmission(row: FormSubmission): void {
    const isCompleted = row.status === SubmissionStatus.Completed;
    const isPending = row.status === SubmissionStatus.Pending;
    const isDrafted = row.status === SubmissionStatus.Drafted;
    const hasClientStep = row.hasClientStep === true;

    if (
      this.overview &&
      this.overview.usage.emailsUsedThisMonth >= this.overview.entitlements.maxEmailPerMonth
    ) {
      const dialogRef = this.matDialog.open(LimitReachedDialogComponent, {
        data: {
          returnUrl: '',
          reason: '',
          planCode: this.overview.planCode,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'billing') {
          this.router.navigate(['/dashboard/billing']);
        } else {
          dialogRef.close();
        }
      });
      return;
    }

    const title = isCompleted
      ? 'Send signed PDF'
      : isPending
        ? 'Resend submission link'
        : isDrafted && !hasClientStep
          ? 'Finalize submission'
          : 'Send submission to signer';

    const message = isCompleted
      ? 'Send the completed submission as a PDF attachment.'
      : isPending
        ? 'Resend the submission link to the external recipient.The previously sent link will be revoke and the new one will be activated.'
        : isDrafted && !hasClientStep
          ? 'This submission does not require any client action. Finalizing it will mark it as completed.'
          : 'Send the submission link to an external user to fill out. If you send it you will no longer be able to edit the submission.';

    const confirmText = isCompleted
      ? 'Send PDF'
      : isPending
        ? 'Resend'
        : isDrafted && !hasClientStep
          ? 'Finalize'
          : 'Send';

    const dialogRef = this.matDialog.open(SendEmailDialogComponent, {
      width: '420px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title,
        message,
        confirmText,
        cancelText: 'Cancel',
        variant: 'mail',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.loading$.next(true);
      const payload: SendForSignatureRequest = confirmed;

      this.formApiService.sendForSignature(row.id!, payload).subscribe({
        next: () => {
          this.loading$.next(false);
          this.billingApiService.loadOverview();
          this.loadSubmissions();

          const successMessage = isCompleted
            ? 'Signed PDF sent successfully.'
            : isPending
              ? 'Access link resent successfully.'
              : isDrafted && !hasClientStep
                ? 'Submission finalized successfully.'
                : 'Access link sent successfully.';

          this.toolsService.showSnackbar(successMessage, 'success-snackbar');
        },
        error: () => {
          this.loading$.next(false);

          const errorMessage = isCompleted
            ? 'Signed PDF could not be sent.'
            : isPending
              ? 'Access link could not be resent.'
              : isDrafted && !hasClientStep
                ? 'Submission could not be finalized.'
                : 'Access link could not be sent.';

          this.toolsService.showSnackbar(errorMessage, 'error-snackbar');
        },
      });
    });
  }

  private setupColums() {
    this.columns = [
      { key: 'formVersion', label: 'Version' },

      { key: 'formName', label: 'Form name', sortable: true, filterable: true },

      {
        key: 'status',
        label: 'Status',
        sortable: true,
        filterable: true,
        formatter: (row: FormSubmission): TableCellBadge => ({
          type: 'badge',
          text: this.getStatusText(row),
          className: getSubmissionStatusColors(row),
        }),
      },

      {
        key: 'ownerConfirmed',
        label: 'Owner',
        formatter: (row: FormSubmission) => this.getOwnerConfirmationText(row),
      },

      {
        key: 'externalConfirmed',
        label: 'Client',
        formatter: (row: FormSubmission) => this.getClientConfirmationText(row),
      },

      {
        key: 'external-link',
        label: 'Client step',
        formatter: (row: FormSubmission) => this.getClientStepText(row),
      },

      {
        key: 'externalRecipientEmail',
        label: 'Client email',
        sortable: true,
        filterable: true,
        formatter: (row: FormSubmission) => this.getClientEmailText(row),
      },

      {
        key: 'createdAtUtc',
        label: 'Created',
        formatter: (row: FormSubmission) => this.formatDateTime(row.createdAtUtc),
      },

      {
        key: 'updatedAtUtc',
        label: 'Updated',
        formatter: (row: FormSubmission) => this.formatDateTime(row.updatedAtUtc),
      },

      {
        key: 'actions',
        label: 'Actions',
        actions: [
          {
            id: 'edit',
            label: 'Edit',
            tooltip: (row: FormSubmission) => this.getEditTooltip(row),
            icon: 'edit',
            handler: (row: FormSubmission) => this.editSubmission(row),
            disabled: (row: FormSubmission) => this.isEditDisabled(row),
          },
          {
            id: 'send',
            label: (row: FormSubmission) => this.getSendActionLabel(row),
            tooltip: (row: FormSubmission) => this.getSendActionTooltip(row),
            icon: (row: FormSubmission) => this.getSendActionIcon(row),
            iconColor: (row: FormSubmission) => this.getSendActionColor(row),
            handler: (row: FormSubmission) => this.handleSendAction(row),
            disabled: (row: FormSubmission) => this.isSendDisabled(row),
          },
          {
            id: 'download',
            label: 'Download',
            tooltip: 'Download PDF',
            icon: 'download',
            handler: (row: FormSubmission) => this.download(row),
          },
          {
            id: 'cancel',
            label: 'Cancel',
            tooltip: (row: FormSubmission) => this.getCancelTooltip(row),
            icon: 'cancel',
            handler: (row: FormSubmission) => this.cancel(row),
            disabled: (row: FormSubmission) => this.isCancelDisabled(row),
          },
        ],
      },
    ];
  }

  getSendActionColor(row: FormSubmission): string {
    const hasEmailQuota =
      (this.overview?.usage?.emailsUsedThisMonth ?? 0) <
      (this.overview?.entitlements?.maxEmailPerMonth ?? 0);

    if (row.status === SubmissionStatus.Completed) {
      return 'green';
    }

    if (row.status === SubmissionStatus.Drafted || row.status === SubmissionStatus.Pending) {
      return hasEmailQuota ? '' : 'red';
    }

    return 'red';
  }

  private formatDateTime(value?: string | Date | null): string {
    return value ? new Date(value).toLocaleString() : '-';
  }

  getStatusText(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed && !row.hasClientStep) {
      return 'Completed';
    }

    if (row.status === SubmissionStatus.Completed && row.hasClientStep) {
      return 'Completed';
    }

    if (row.status === SubmissionStatus.Pending) {
      return 'Pending';
    }

    if (row.status === SubmissionStatus.Drafted) {
      return 'Drafted';
    }

    return row.status;
  }

  getOwnerConfirmationText(row: FormSubmission): string {
    return row.ownerConfirmed ? 'Confirmed' : 'Draft';
  }

  getClientConfirmationText(row: FormSubmission): string {
    if (!row.hasClientStep) {
      return 'N/A';
    }

    return row.externalConfirmed ? 'Confirmed' : 'Waiting';
  }

  getClientStepText(row: FormSubmission): string {
    if (!row.hasClientStep) {
      return row.status === SubmissionStatus.Completed ? 'Not required' : 'No client step';
    }

    switch (row.status) {
      case SubmissionStatus.Drafted:
        return 'Ready to send';
      case SubmissionStatus.Pending:
        return 'Awaiting response';
      case SubmissionStatus.Completed:
        return 'Completed';
      case SubmissionStatus.Cancelled:
        return 'Cancelled';
      case SubmissionStatus.Expired:
        return 'Expired';
      default:
        return '-';
    }
  }

  getClientEmailText(row: FormSubmission): string {
    if (!row.hasClientStep) {
      return 'N/A';
    }

    return row.externalRecipientEmail?.trim() ? row.externalRecipientEmail : '-';
  }

  getStatusDescription(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed && !row.hasClientStep) {
      return 'Finalized by owner';
    }

    if (row.status === SubmissionStatus.Completed && row.hasClientStep) {
      return 'Completed by client';
    }

    if (row.status === SubmissionStatus.Pending) {
      return 'Waiting for client';
    }

    if (row.status === SubmissionStatus.Drafted) {
      return row.hasClientStep ? 'Not sent yet' : 'Ready to finalize';
    }

    return '';
  }

  getSendActionLabel(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed) {
      return 'Send PDF';
    }

    if (row.status === SubmissionStatus.Pending) {
      return 'Resend link';
    }

    if (row.status === SubmissionStatus.Drafted) {
      return row.hasClientStep ? 'Send link' : 'Finalize & send PDF';
    }

    return 'Send';
  }

  getSendActionTooltip(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed) {
      return 'Send the completed submission as a PDF attachment';
    }

    if (row.status === SubmissionStatus.Pending) {
      return 'Resend the access link to the client';
    }

    if (row.status === SubmissionStatus.Drafted) {
      return row.hasClientStep
        ? 'Send this submission to the client for completion'
        : 'Finalize this submission and send it as a PDF';
    }

    return 'Send';
  }

  getSendActionIcon(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed) {
      return 'picture_as_pdf';
    }

    if (row.status === SubmissionStatus.Pending) {
      return 'outgoing_mail';
    }

    if (row.status === SubmissionStatus.Drafted) {
      return row.hasClientStep ? 'outgoing_mail' : 'picture_as_pdf';
    }

    return 'warning';
  }

  isEditDisabled(row: FormSubmission): boolean {
    return (
      row.status === SubmissionStatus.Pending ||
      row.status === SubmissionStatus.Completed ||
      row.status === SubmissionStatus.Cancelled ||
      row.status === SubmissionStatus.Expired
    );
  }

  getEditTooltip(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Pending) {
      return 'Editing is locked after sending to the client';
    }

    if (row.status === SubmissionStatus.Completed) {
      return 'Completed submissions cannot be edited';
    }

    if (row.status === SubmissionStatus.Cancelled) {
      return 'Cancelled submissions cannot be edited';
    }

    if (row.status === SubmissionStatus.Expired) {
      return 'Expired submissions cannot be edited';
    }

    return 'Edit submission';
  }

  isSendDisabled(row: FormSubmission): boolean {
    const hasEmailQuota =
      (this.overview?.usage?.emailsUsedThisMonth ?? 0) <
      (this.overview?.entitlements?.maxEmailPerMonth ?? 0);

    if (!hasEmailQuota) {
      return true;
    }

    return row.status === SubmissionStatus.Cancelled || row.status === SubmissionStatus.Expired;
  }

  isCancelDisabled(row: FormSubmission): boolean {
    return (
      row.status === SubmissionStatus.Completed ||
      row.status === SubmissionStatus.Cancelled ||
      row.status === SubmissionStatus.Expired
    );
  }

  getCancelTooltip(row: FormSubmission): string {
    if (row.status === SubmissionStatus.Completed) {
      return 'Completed submissions cannot be cancelled';
    }

    if (row.status === SubmissionStatus.Cancelled) {
      return 'This submission is already cancelled';
    }

    if (row.status === SubmissionStatus.Expired) {
      return 'Expired submissions cannot be cancelled';
    }

    return 'Cancel submission';
  }

  handleSendAction(row: FormSubmission): void {
    if (
      row.status === SubmissionStatus.Drafted ||
      row.status === SubmissionStatus.Pending ||
      row.status === SubmissionStatus.Completed
    ) {
      this.sendSubmission(row);
    }
  }

  private setupTrend(response: SubmissionTrendResponse) {
    const formatLabel = (label: string): string => {
      if (response.granularity === 'month') {
        const date = new Date(label + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      if (response.granularity === 'week') {
        const date = new Date(label);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // day
      const date = new Date(label);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const createdPoints = response.points.map((p) => ({
      label: formatLabel(p.label),
      value: p.created,
    }));

    const completedPoints = response.points.map((p) => ({
      label: formatLabel(p.label),
      value: p.completed,
    }));

    this.trendChartData = {
      title: 'Submission activity',
      subtitle: 'Created and completed submissions over time',
      series: [
        {
          name: 'Created',
          points: createdPoints,
        },
        {
          name: 'Completed',
          points: completedPoints,
        },
      ],
    };
  }

  private setupOverViewCards(response: SubmissionSummaryResponse<FormSubmission>) {
    this.overviewCards = [
      {
        label: 'Total submissions',
        value: response.totalCount,
        hint: 'All created submissions',
      },
      {
        label: 'Pending',
        value: response.pendingCount,
        hint: 'Still waiting for completion',
        accent: 'warning',
      },
      {
        label: 'Completed',
        value: response.completedCount,
        hint: 'Finalized successfully',
        accent: 'success',
      },
      {
        label: 'Completion rate',
        value: response.completionRate,
        hint: 'Completed / total submissions',
        accent: 'info',
      },
    ];
  }

  private setActions() {
    this.pageActionService.clearActionsByOwner(this.pageOwner);
    this.pageActionService.addAction({
      id: 'show-chart',
      iconName: 'bar_chart',
      iconTooltip: 'Show chart',
      disabled: this.showChart,
      text: '',
      owner: this.pageOwner,
      handler: () => this.chartOrList(true),
    });
    this.pageActionService.addAction({
      id: 'show-list',
      iconName: 'list',
      iconTooltip: 'Show list',
      disabled: !this.showChart,
      text: '',
      owner: this.pageOwner,
      handler: () => this.chartOrList(false),
    });
  }

  private setHeaderSearch() {
    if (!this.showChart) {
      this.headerSearchService.show({
        owner: this.pageOwner,
        placeholder: 'Search submissions...',
        value: '',
      });
    }
  }

  private setDateRange() {
    if (this.showChart) {
      this.dateRangeService.show({
        owner: this.pageOwner,
        value: { end: null, start: null, preset: null },
      });
    }
  }

  private chartOrList(value: boolean) {
    const isChart = this.showChart;
    if (isChart != value) {
      this.showChart = value;
      this.setActions();
    }

    if (!this.showChart) {
      this.dateRangeService.clearByOwner(this.pageOwner);
      this.searchTerm = '';
      this.loadSubmissions(1, this.searchTerm);
      this.setHeaderSearch();
    }

    if (this.showChart) {
      this.headerSearchService.clearByOwner(this.pageOwner);
      this.headerSearchService.updateValue('');
      this.dateRange = this.getDefaultRange();
      this.loadSummary();
      this.loadTrend();
      this.setDateRange();
    }
  }

  ngOnDestroy() {
    this.pageActionService.clearActionsByOwner(this.pageOwner);
    this.headerSearchService.clearByOwner(this.pageOwner);
    this.dateRangeService.clearByOwner(this.pageOwner);
  }
}
