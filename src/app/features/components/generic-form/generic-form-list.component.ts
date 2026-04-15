import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { Router } from '@angular/router';
import { FormDefinition } from '../../../shared/models/form-generator.mode';
import { ToolsService } from '../../../shared/services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  DialogResults,
} from '../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { EditMode } from '../../../shared/models/auth.model';
import { LimitReachedDialogComponent } from '../../../shared/components/dialogs/limit-reached-dialog/limit-reached-dialog.component';
import { PageActionService } from '../../../shared/services/header/page-action.service';

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
    private readonly router: Router,
    private readonly billingApiService: BillingApiService,
    private readonly pageActionService: PageActionService,
  ) {}

  ngOnInit() {
    this.loading$.next(true);
    this.configurePageAction();
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

  makeCopy(formDef: FormDefinition) {
    if (!this.limitCheck()) {
      return;
    }

    this.loading$.next(true);

    this.formApiService.createForm(formDef).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.billingApiService.loadOverview();
          this.loading$.next(false);
          this.toolsService.showSnackbar('Form created successfully.', 'success-snackbar');
          this.router.navigate(['/dashboard/forms', response.id, EditMode.EDIT]);
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

  onPreviewClick(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/form-generator/', formDef.id, EditMode.VIEW]);
  }

  editFlow(formDef: FormDefinition) {
    this.router.navigate(['/dashboard/form-generator/', formDef.id, EditMode.EDIT]);
  }

  goToCreateForm() {
    this.router.navigate(['/dashboard/form-generator', EditMode.CREATE]);
  }

  createSubmission(formDef: FormDefinition) {
    const overview = this.billingApiService.getOverviewResponse();
    if (
      overview &&
      overview.usage.submissionsUsedThisMonth >= overview.entitlements.maxSubmissionsPerMonth
    ) {
      const dialogRef = this.matDialog.open(LimitReachedDialogComponent, {
        data: {
          returnUrl: '',
          reason: '',
          planCode: overview.planCode,
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

    this.router.navigate(['/dashboard/forms', formDef.id, EditMode.CREATE]);
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

    dialogRef.afterClosed().subscribe((confirmed: DialogResults) => {
      if (confirmed === DialogResults.save) {
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

  private configurePageAction() {
    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Create',
      owner: 'generic-form-list',
      handler: () => this.createForm(),
    });
  }

  private createForm() {
    if (!this.limitCheck()) {
      return;
    }

    this.router.navigate(['dashboard/form-generator', EditMode.CREATE]);
  }

  private limitCheck() {
    const overview = this.billingApiService.getOverviewResponse();

    if (overview && overview.usage.activeFlowsUsed >= overview.entitlements.maxActiveFlows) {
      const dialogRef = this.matDialog.open(LimitReachedDialogComponent, {
        data: {
          returnUrl: '',
          reason: '',
          planCode: overview.planCode,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'billing') {
          this.router.navigate(['/dashboard/billing']);
        } else {
          dialogRef.close();
        }
      });

      return false;
    }

    return true;
  }

  ngOnDestroy() {
    this.pageActionService.clearActionsByOwner('generic-form-list');
  }
}
