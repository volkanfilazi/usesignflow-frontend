import { Component } from '@angular/core';
import { FormsApiService } from '../../../shared/services/form-api.service';
import {
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
      key: 'signatures',
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
          label: 'download',
          icon: 'download',
          handler: (row) => this.download(row),
        },
      ],
    },
  ];

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly matDialog: MatDialog,
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
        const externalSignatureField = row.fieldsSnapshot.find(
          (f) => f.type === 'signaturePad' && f.assignedTo === 'External',
        );

        if (!externalSignatureField) {
          console.error('External signature field not found');
          return;
        }

        this.formApiService
          .sendForSignature(row.id!, {
            signatureFieldId: externalSignatureField.fieldId,
            email: confirmed,
          })
          .subscribe({
            next: () => {
              setTimeout(() => {
                this.loading$.next(false);
                this.toolsService.showSnackbar('Form created successfully.', 'success-snackbar');
              });
            },
            error: () => {
              setTimeout(() => {
                this.loading$.next(false);
                this.toolsService.showSnackbar('Form could not be created.', 'error-snackbar');
              });
            },
          });
      }
    });
  }
}
