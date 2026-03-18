import { Component } from '@angular/core';
import { FormsApiService } from '../../../shared/services/form-api.service';
import {
  FieldDefinition,
  FormSubmission,
  getSubmissionMode,
  getSubmissionStatusColors,
} from '../../../shared/models/form-generator.mode';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TableColumnDefinition } from '../../../shared/components/table/table.component';
import { Router } from '@angular/router';
import { ToolsService } from '../../../shared/services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { SendEmailDialogComponent } from '../../../shared/components/dialogs/send-email-dialog/send-email-dialog.component';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ConfirmDialogComponent } from '../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-submissions',
  styleUrl: './submissions.component.scss',
  templateUrl: './submissions.component.html',
  standalone: false,
})
export class SubmissionsComponent {
  private readonly destroy$ = new Subject<void>();

  submissions: FormSubmission[] = [];
  loading$ = new BehaviorSubject(true);
  columns: TableColumnDefinition<FormSubmission>[] = [
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
      label: 'Owner',
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
      label: 'External signer',
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

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly matDialog: MatDialog,
    private readonly authStateService: AuthStateService,
  ) {}

  ngOnInit() {
    this.loadSubmissions();
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
        console.error('Error fetching forms:', error);
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `submission-${row?.id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
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

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.loading$.next(true);

      this.formApiService.cancelSubmission(row.id!).subscribe({
        next: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Submission cancelled successfully.', 'success-snackbar');
          this.loadSubmissions();
        },
        error: (error: any) => {
          this.loading$.next(false);
        },
      });
    });
  }

  private canCancel(row: FormSubmission): boolean {
    return row.status !== 'Completed' && row.status !== 'Cancelled' && row.status !== 'Expired';
  }

  private hasExternalSignature(fields: FieldDefinition[]): boolean {
    return fields.some((f) => f.type === 'signaturePad' && f.assignedTo === 'External');
  }

  private hasOwnerSignature(fields: FieldDefinition[]): boolean {
    return fields.some((f) => f.type === 'signaturePad' && f.assignedTo === 'Owner');
  }

  private sendToSigner(row: FormSubmission): void {
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

        this.formApiService
          .sendForSignature(row.id!, {
            email: confirmed,
          })
          .subscribe({
            next: () => {
              this.loading$.next(false);
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
