import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { Router } from '@angular/router';
import { FormDefinition } from '../../../shared/models/form-generator.mode';
import { ToolsService } from '../../../shared/services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { EditMode } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-generic-form-list',
  templateUrl: './generic-form-list.component.html',
  styleUrl: './generic-form-list.component.scss',
  standalone: false,
})
export class GenericFormListComponent implements OnInit {
  @Input() formNameChanged: string | undefined;
  @Input() myGroup: FormGroup | undefined;

  forms: FormDefinition[] = [];
  loading$ = new BehaviorSubject(false);

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly toolsService: ToolsService,
    private readonly matDialog: MatDialog,
    private router: Router,
    private readonly billingApiService: BillingApiService,
  ) {}

  ngOnInit() {
    this.loading$.next(true);
    this.loadForms();
  }

  private loadForms() {
    this.formApiService.getForms().subscribe({
      next: (forms) => {
        this.forms = forms;
        this.loading$.next(false);
      },
      error: (error) => {
        this.loading$.next(false);
      },
    });
  }

  onPreviewClick(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/form-generator/', formDef.id, EditMode.VIEW]);
  }

  editFlow(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/form-generator/', formDef.id, EditMode.EDIT]);
  }

  goToCreateForm() {
    this.router.navigate(['/dashboard/form-generator']);
  }

  createSubmission(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/forms', formDef.id]);
  }

  deleteFormitem(id: string) {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
      width: '420px',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: 'Delete this form?',
        message: 'This action cannot be undone. The selected form will be permanently removed.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.loading$.next(true);
        this.formApiService.deleteForm(id).subscribe({
          next: () => {
            setTimeout(() => {
              this.toolsService.showSnackbar('Form deleted successfully.', 'success-snackbar');
              this.billingApiService.loadOverview();
              this.loadForms();
            });
          },
          error: () => {
            setTimeout(() => {
              this.toolsService.showSnackbar('Form could not be deleted.', 'error-snackbar');
              this.loading$.next(false);
            });
          },
        });
      }
    });
  }
}
