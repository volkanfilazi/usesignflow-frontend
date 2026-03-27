import { Component } from '@angular/core';
import { FormsApiService } from '../../../shared/services/form-api.service';
import {
  FieldDefinition,
  FormSubmission,
  getSubmissionMode,
  getSubmissionStatusColors,
  SendForSignatureRequest,
} from '../../../shared/models/form-generator.mode';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  TableColumnDefinition,
  TableEmptyStateMessage,
} from '../../../shared/components/table/table.component';
import { Router } from '@angular/router';
import { ToolsService } from '../../../shared/services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { SendEmailDialogComponent } from '../../../shared/components/dialogs/send-email-dialog/send-email-dialog.component';
import { AuthStateService } from '../../../core/services/auth-state.service';
import {
  ConfirmDialogComponent,
  DialogResults,
} from '../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { BillingOverviewResponse } from '../../../shared/models/payment.model';
import { LimitReachedDialogComponent } from '../../../shared/components/dialogs/limit-reached-dialog/limit-reached-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfReaderDialogComponent } from '../../../shared/components/dialogs/pdf-reader/pdf-reader.component';

@Component({
  selector: 'app-submissions',
  styleUrl: './submissions.component.scss',
  templateUrl: './submissions.component.html',
  standalone: false,
})
export class SubmissionsComponent {
  private readonly destroy$ = new Subject<void>();
  private overview: BillingOverviewResponse | null = null;

  tableEmptyStateMessage: TableEmptyStateMessage | undefined;
  submissions: FormSubmission[] = [];
  loading$ = new BehaviorSubject(true);
  columns: TableColumnDefinition<FormSubmission>[] = [];

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly matDialog: MatDialog,
    private readonly authStateService: AuthStateService,
    private readonly billingApiService: BillingApiService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
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
  }

  setupColums() {
    this.columns = [
      { key: 'formVersion', label: 'Version' },
      { key: 'formName', label: 'Form name' },
      {
        key: 'status',
        label: 'Status',
        formatter: (row: any) => {
          const result = getSubmissionStatusColors(row);
          return {
            type: 'badge',
            text: row.status,
            className: result,
          };
        },
      },
      {
        key: 'signedOwner',
        label: 'You',
        formatter: (row: FormSubmission) => {
          const result =
            row.signatures
              ?.filter((sign) => sign.signedByUserId === this.authStateService.getUserId())
              .map((sign) => sign.signedByEmail) ?? '';

          return result?.length
            ? result.join(', ')
            : this.hasOwnerSignature(row.fieldsSnapshot)
              ? 'Pending'
              : 'N/A';
        },
      },
      {
        key: 'signedExternal',
        label: 'Client',
        formatter: (row: FormSubmission) => {
          const result =
            row.signatures
              ?.filter((sign) => sign.signedByUserId !== this.authStateService.getUserId())
              .map((sign) => sign.signedByEmail) ?? '';

          return result?.length
            ? result.join(', ')
            : this.hasExternalSignature(row.fieldsSnapshot)
              ? 'Pending'
              : 'N/A';
        },
      },
      {
        key: 'createdAtUtc',
        label: 'Created At',
        formatter: (row) => (row.createdAtUtc ? new Date(row.createdAtUtc).toLocaleString() : '-'),
      },
      {
        key: 'updatedAtUtc',
        label: 'Updated At',
        formatter: (row) => (row.updatedAtUtc ? new Date(row.updatedAtUtc).toLocaleString() : '-'),
      },
      {
        key: 'actions',
        label: 'Actions',
        actions: [
          {
            id: 'edit',
            label: 'Edit',
            icon: 'edit',
            handler: (row) => this.editSubmission(row),
          },
          {
            id: 'send-to-signer',
            label: 'Send to signer',
            icon: 'outgoing_mail',
            iconColor:
              (this.overview?.usage?.emailsUsedThisMonth ?? 0) <
              (this.overview?.entitlements?.maxEmailPerMonth ?? 0)
                ? 'green'
                : 'red',
            handler: (row) => this.sendToSigner(row),
          },
          {
            id: 'download',
            label: 'Download',
            icon: 'download',
            handler: (row) => this.download(row),
          },
          {
            id: 'cancel',
            label: 'Cancel',
            icon: 'cancel',
            handler: (row) => this.cancel(row),
          },
        ],
      },
    ];
  }

  editSubmission(row: FormSubmission): void {
    const mode = getSubmissionMode(row);
    this.router.navigate(['/dashboard/submissions', row.id, mode]);
  }

  loadSubmissions() {
    this.formApiService.getSubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.loading$.next(false);
      },
      error: (error) => {
        this.loading$.next(false);
      },
    });
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

  private hasExternalSignature(fields: FieldDefinition[]): boolean {
    return fields.some((f) => f.type === 'Signature' && f.assignedTo === 'Client');
  }

  private hasOwnerSignature(fields: FieldDefinition[]): boolean {
    return fields.some((f) => f.type === 'Signature' && f.assignedTo === 'You');
  }

  private sendToSigner(row: FormSubmission): void {
    if (
      this.overview &&
      this.overview?.usage.emailsUsedThisMonth >= this.overview?.entitlements.maxEmailPerMonth
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

    const dialogRef = this.matDialog.open(SendEmailDialogComponent, {
      width: '420px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Send submission to signer',
        message: 'Send the assignment to an external user to fill out.',
        confirmText: 'Send',
        cancelText: 'Cancel',
        variant: 'mail',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.loading$.next(true);
        const payload: SendForSignatureRequest = confirmed;

        this.formApiService.sendForSignature(row.id!, payload).subscribe({
          next: () => {
            this.loading$.next(false);
            this.billingApiService.loadOverview();
            this.loadSubmissions();
            this.toolsService.showSnackbar('Access link sent successfully.', 'success-snackbar');
          },
          error: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar('Access link could not be sent.', 'error-snackbar');
          },
        });
      }
    });
  }
}
