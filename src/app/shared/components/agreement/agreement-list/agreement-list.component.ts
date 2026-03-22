import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AgreementTemplate } from '../../../models/form-generator.mode';
import { FormControl, FormGroup } from '@angular/forms';
import { AgreementApiService } from '../../../services/agreement-api.service';
import { ToolsService } from '../../../services/tools.service';
import { ValidationService } from '../../../services/validation.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-agreement-list',
  templateUrl: './agreement-list.component.html',
  standalone: false,
})
export class AgreementListComponent implements OnInit {
  loading$ = new BehaviorSubject(false);
  agreementForm: FormGroup | undefined;
  mode: 'list' | 'create' = 'list';
  agreements: AgreementTemplate[] = [];
  selectedAgreementId: string | null = null;
  validationErrors: ValidationIssue[] | undefined;

  constructor(
    private readonly agreementApiService: AgreementApiService,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private readonly matDialog: MatDialog,
    private dialogRef: MatDialogRef<AgreementListComponent>,
  ) {}

  ngOnInit() {
    this.loading$.next(true);
    this.loadAgreements();
    this.agreementForm = new FormGroup({
      name: new FormControl(),
      title: new FormControl(),
      content: new FormControl(),
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openAgreementCreate() {
    this.mode = 'create';
  }

  createAgreement() {
    this.validationErrors = [];

    if (!this.agreementForm) {
      return;
    }

    if (this.agreementForm.invalid) {
      this.agreementForm.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.agreementForm);

      return;
    }

    this.loading$.next(true);

    const agreement: AgreementTemplate = {
      name: this.agreementForm?.value.name,
      title: this.agreementForm?.value.title,
      content: this.agreementForm?.value.content,
    };

    this.agreementApiService.create(agreement).subscribe({
      next: () => {
        setTimeout(() => {
          this.toolsService.showSnackbar('Agreement created successfully.', 'success-snackbar');
          this.loadAgreements();
        });
      },
      error: () => {
        setTimeout(() => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Agreement could not be created.', 'error-snackbar');
        });
      },
    });
  }

  useAgreement(item: AgreementTemplate) {
    this.dialogRef.close(item);
  }

  deleteAgreement(item: AgreementTemplate) {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '450px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Are you sure you want to delete this agreement?',
        message:
          'This action cannot be undone. The selected agreement will be permanently removed.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.loading$.next(true);

        if (item.id) {
          this.agreementApiService.delete(item.id).subscribe({
            next: () => {
              setTimeout(() => {
                this.toolsService.showSnackbar(
                  'Agreement deleted successfully.',
                  'success-snackbar',
                );
                this.loadAgreements();
              });
            },
            error: () => {
              setTimeout(() => {
                this.loading$.next(false);
                this.toolsService.showSnackbar('Agreement could not be deleted.', 'error-snackbar');
              });
            },
          });
        }
      }
    });
  }

  backToLibrary() {
    this.mode = 'list';
  }

  private loadAgreements() {
    this.agreementApiService.getAgreements().subscribe({
      next: (agreements) => {
        this.agreements = agreements;
        this.loading$.next(false);
        this.mode = 'list';
      },
      error: (error) => {
        this.loading$.next(false);
      },
    });
  }
}
