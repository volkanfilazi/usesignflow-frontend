import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { FormsApiService } from '../../../shared/services/form-api.service';
import { PageActionService } from '../../../shared/services/page-action.service';
import { ToolsService } from '../../../shared/services/tools.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

import {
  CreateFormSubmissionRequest,
  FieldDefinition,
  FormDefinition,
  FormSubmission,
  options,
  UpdateFormSubmissionRequest,
} from '../../../shared/models/form-generator.mode';
import { BillingApiService } from '../../services/billing-api-service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PendingChangesAware } from '../../models/pending-changes-aware.model';
import { EditMode } from '../../models/auth.model';
import { canEditField } from '../../utility/form-permission/form-permission-helper';

@Component({
  selector: 'app-dynamic-form-renderer',
  templateUrl: './dynamic-form-renderer.component.html',
  styleUrl: './dynamic-form-renderer.component.scss',
  standalone: false,
})
export class DynamicFormRendererComponent implements OnInit, OnDestroy, PendingChangesAware {
  @Input() previewForm: FormDefinition | undefined;

  editMode: EditMode = EditMode.CREATE;
  buildingForm = true;
  loading$ = new BehaviorSubject(false);
  myGroup = new FormGroup({});
  form: FormDefinition | FormSubmission | undefined;
  elementOptions = options;
  validationErrors: ValidationIssue[] | undefined;
  fieldLabelMap: Record<string, string> = {};
  currentUserId = '';
  externalUserToken = '';
  submissinTitle = '';
  pageOwner = 'dynamic-form-renderer';
  agreementContentSafeHtml: SafeHtml | null = null;

  private initialFormValue: any = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly pageActionService: PageActionService,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private readonly router: Router,
    private readonly authService: AuthStateService,
    private readonly billingApiService: BillingApiService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  public hasPendingChanges(): boolean {
    if (this.editMode === EditMode.VIEW) {
      return false;
    }

    return this.hasFormChanged();
  }

  public saveBeforeLeave(): Observable<boolean> {
    if (this.editMode === EditMode.VIEW) {
      return of(true);
    }

    return this.editMode === EditMode.CREATE ? this.create() : this.update();
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId() ?? '';

    if (this.previewForm) {
      this.editMode = EditMode.VIEW;
      this.configurePageAction();
      this.loadPreviewForm(this.previewForm);
      return;
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const formId = params.get('formId');
      const submissionId = params.get('submissionId');
      this.externalUserToken = this.route.snapshot.queryParamMap.get('token') ?? '';

      this.resetState();

      if (formId) {
        this.editMode = EditMode.CREATE;
        this.configurePageAction();
        this.loadForm(formId);
        return;
      }

      if (submissionId) {
        this.editMode = EditMode.EDIT;
        this.configurePageAction();
        this.loadSubmission(submissionId, this.externalUserToken || undefined);
      }
    });
  }

  private resetState(): void {
    this.buildingForm = true;
    this.validationErrors = [];
    this.fieldLabelMap = {};
    this.myGroup = new FormGroup({});
    this.initialFormValue = null;
  }

  private configurePageAction(): void {
    this.pageActionService.addAction({
      id: 'save-ui',
      owner: this.pageOwner,
      text: 'Save',
      handler: () => {
        const action$ = this.editMode === EditMode.CREATE ? this.create() : this.update();

        action$.subscribe((success) => {
          if (!success) return;

          if (this.editMode === EditMode.CREATE) {
            this.router.navigate(['/dashboard/submissions']);
            return;
          }

          if (this.externalUserToken && this.form?.id) {
            this.router.navigate(['submission-access', this.form.id, 'completed'], {
              state: { token: this.externalUserToken },
            });
          } else {
            this.router.navigate(['/dashboard/submissions']);
          }
        });
      },
    });
  }

  private loadForm(formId: string): void {
    this.formApiService
      .getFormById(formId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (form) => {
          this.form = form;
          this.buildFormControls(undefined, this.getFields());
          this.finishBuild();
        },
        error: () => {
          this.buildingForm = false;
        },
      });
  }

  private loadSubmission(submissionId: string, accessToken?: string): void {
    this.formApiService
      .getSubmissionById(submissionId, accessToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submission) => {
          this.form = submission;
          this.buildFormControls(submission, this.getFields(), submission.answers);
          this.finishBuild();
        },
        error: () => {
          this.buildingForm = false;
        },
      });
  }

  private loadPreviewForm(previewForm: FormDefinition): void {
    this.resetState();

    this.form = {
      id: 'preview',
      formName: previewForm.formName,
      version: previewForm.version,
      expanded: previewForm.expanded,
      fields: previewForm.fields,
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: null,
      ownerUserId: this.currentUserId,
      agreementContentHtml: previewForm.agreementContentHtml,
    };

    this.buildFormControls(undefined, this.getFields());
    this.finishBuild();
  }

  private finishBuild(): void {
    this.buildingForm = false;
    this.setAgreementContent(this.form?.agreementContentHtml);
    this.cdr.detectChanges();
  }

  setAgreementContent(html: string | null | undefined): void {
    const normalized = html ?? '';
    this.agreementContentSafeHtml = this.sanitizer.bypassSecurityTrustHtml(normalized);
  }

  private buildFormControls(
    submission: FormSubmission | undefined,
    fields: FieldDefinition[],
    answers?: { fieldId: string; value: any }[],
  ): void {
    fields.forEach((field) => {
      this.fieldLabelMap[field.fieldId] = field.label;

      const rawValue = answers?.find((x) => x.fieldId === field.fieldId)?.value;
      const existingValue =
        field.type === 'Checkbox' || field.type === 'Agreement'
          ? rawValue === true || rawValue === 'true'
          : (rawValue ?? null);

      const validators =
        field.type === 'Agreement'
          ? field.required && this.canEditField(field, submission)
            ? [Validators.requiredTrue]
            : []
          : this.buildFieldValidators(field, submission);

      this.myGroup.addControl(
        field.fieldId,
        new FormControl(
          {
            value: existingValue,
            disabled: !this.canEditField(field, submission),
          },
          validators,
        ),
      );
    });

    this.submissinTitle = submission?.formName ?? '';
    this.captureInitialFormValue();
  }

  private buildFieldValidators(field: FieldDefinition, submission?: FormSubmission): ValidatorFn[] {
    return this.validationService.buildValidators(
      field,
      this.shouldValidateField(field, submission),
    );
  }

  getFields(): FieldDefinition[] {
    if (!this.form) return [];

    if (this.editMode === EditMode.VIEW && this.isFormDefinition(this.form)) {
      return this.form.fields;
    }

    if (this.isFormDefinition(this.form)) {
      return this.form.fields;
    }

    if (this.isFormSubmission(this.form)) {
      return this.form.fieldsSnapshot;
    }

    return [];
  }

  getFieldLabel(field: FieldDefinition): string {
    return field.label;
  }

  getFormTitle(): { title: string; status?: string } {
    if (!this.form) {
      return { title: '' };
    }

    if (this.isFormDefinition(this.form)) {
      return { title: this.form.formName };
    }

    if (this.isFormSubmission(this.form)) {
      return {
        title: `Submission: ${this.submissinTitle}`,
        status: this.form.status,
      };
    }

    return { title: '' };
  }

  private isExternalUser(): boolean {
    return !!this.externalUserToken;
  }

  private isSubmissionEditableByActor(submission: FormSubmission): boolean {
    if (this.isExternalUser()) {
      return submission.status === 'Pending';
    }

    return submission.status === 'Drafted';
  }

  private isFieldAssignedToActor(field: FieldDefinition): boolean {
    const assignedTo = field.assignedTo ?? 'You';

    if (this.isExternalUser()) {
      return assignedTo === 'Client';
    }

    return assignedTo === 'You';
  }

  canEditField(field: FieldDefinition, submission?: FormSubmission): boolean {
    const currentSubmission =
      submission ?? (this.isFormSubmission(this.form) ? this.form : undefined);

    return canEditField({
      editMode: this.editMode,
      isExternalUser: !!this.externalUserToken,
      assignedTo: field.assignedTo ?? 'You',
      submissionStatus: currentSubmission?.status,
    });
  }

  isDisabled(field: FieldDefinition): boolean {
    return !this.canEditField(field);
  }

  shouldValidateField(field: FieldDefinition, submission?: FormSubmission): boolean {
    return this.canEditField(field, submission);
  }

  canShowExternalSaveButton(): boolean {
    return (
      !!this.externalUserToken && this.isFormSubmission(this.form) && this.form.status === 'Pending'
    );
  }

  create(): Observable<boolean> {
    this.validationErrors = [];

    if (!this.form || !this.myGroup) {
      return of(false);
    }

    const formId = this.getFormId();
    if (!formId) {
      return of(false);
    }

    this.myGroup.updateValueAndValidity();

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(
        this.myGroup,
        this.fieldLabelMap,
      );
      return of(false);
    }

    this.loading$.next(true);

    const rawFormValue = this.myGroup.getRawValue() as Record<string, unknown>;
    const fields = this.getFields();

    const answers = fields.map((field) => ({
      fieldId: field.fieldId,
      value: this.normalizeAnswerValue(rawFormValue[field.fieldId] ?? null),
    }));

    return this.uploadAllChangedSignatures$(answers, undefined, formId, true).pipe(
      tap((success) => {
        if (success) {
          this.captureInitialFormValue();
        }
      }),
      finalize(() => {
        this.loading$.next(false);
      }),
    );
  }

  onUpdateClick(): void {
    this.update().subscribe((success) => {
      if (success && this.externalUserToken && this.form?.id) {
        this.router.navigate(['submission-access', this.form.id, 'completed'], {
          state: { token: this.externalUserToken },
        });
      }
    });
  }

  private update(): Observable<boolean> {
    this.validationErrors = [];

    if (!this.form || !this.myGroup) {
      return of(false);
    }

    if (!this.isFormSubmission(this.form)) {
      return of(false);
    }

    if (!this.isSubmissionEditableByActor(this.form)) {
      this.toolsService.showSnackbar('This submission is no longer editable.', 'error-snackbar');
      return of(false);
    }

    this.myGroup.updateValueAndValidity();

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(
        this.myGroup,
        this.fieldLabelMap,
      );
      return of(false);
    }

    if (!this.hasPendingChanges()) {
      this.toolsService.showSnackbar('No changes', 'error-snackbar');
      return of(false);
    }

    this.loading$.next(true);

    const rawFormValue = this.myGroup.getRawValue() as Record<string, unknown>;
    const fields = this.getFields();

    const answers = fields.map((field) => ({
      fieldId: field.fieldId,
      value: this.normalizeAnswerValue(rawFormValue[field.fieldId] ?? null),
    }));

    return this.uploadAllChangedSignatures$(answers, this.form.rowVersion, undefined, false).pipe(
      tap((success) => {
        if (success) {
          this.captureInitialFormValue();
        }
      }),
      finalize(() => {
        this.loading$.next(false);
      }),
    );
  }

  private uploadAllChangedSignatures$(
    answers: { fieldId: string; value: any }[],
    rowVersion?: number,
    formId?: string,
    isCreate = false,
  ): Observable<boolean> {
    const signatureFields = this.getFields().filter(
      (field) => field.type === 'Signature' && this.canEditField(field),
    );

    const signaturesToUpload = signatureFields
      .map((field) => ({
        fieldId: field.fieldId,
        value: this.myGroup.get(field.fieldId)?.value,
      }))
      .filter((item) => this.isBase64Image(item.value));

    if (!signaturesToUpload.length) {
      return isCreate
        ? this.submitSubmission$(formId!, answers)
        : this.updateSubmission$(rowVersion!, answers);
    }

    let request$: Observable<{ fieldId: string; value: any }[]> = of(answers);

    signaturesToUpload.forEach((signature) => {
      request$ = request$.pipe(
        switchMap((currentAnswers) => {
          const file = this.base64ToFile(signature.value, 'signature.png');
          const accessToken = this.route.snapshot.queryParamMap.get('token');

          return this.formApiService
            .uploadSignature(file, isCreate ? undefined : (accessToken ?? undefined))
            .pipe(
              map((uploadRes) =>
                currentAnswers.map((answer) =>
                  answer.fieldId === signature.fieldId
                    ? { ...answer, value: uploadRes.url }
                    : answer,
                ),
              ),
            );
        }),
      );
    });

    return request$.pipe(
      switchMap((finalAnswers) =>
        isCreate
          ? this.submitSubmission$(formId!, finalAnswers)
          : this.updateSubmission$(rowVersion!, finalAnswers),
      ),
      catchError(() => {
        this.toolsService.showSnackbar('Signature could not be uploaded.', 'error-snackbar');
        return of(false);
      }),
    );
  }

  private isBase64Image(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('data:image');
  }

  private updateSubmission$(
    rowVersion: number,
    answers: { fieldId: string; value: any }[],
  ): Observable<boolean> {
    if (!this.form?.id) {
      return of(false);
    }

    const payload: UpdateFormSubmissionRequest = {
      answers,
      rowVersion,
    };

    if (this.externalUserToken) {
      return this.formApiService
        .updateSubmissionByAccessToken(this.form.id, {
          token: this.externalUserToken,
          rowVersion,
          answers,
        })
        .pipe(
          map(() => {
            this.toolsService.showSnackbar(
              'The document has been successfully completed.',
              'success-snackbar',
            );
            return true;
          }),
          catchError((err) => {
            console.error('UPDATE BY ACCESS TOKEN ERROR:', err);
            this.toolsService.showSnackbar(
              'The document could not be completed.',
              'error-snackbar',
            );
            return of(false);
          }),
        );
    }

    return this.formApiService.updateSubmission(this.form.id, payload).pipe(
      map(() => {
        this.toolsService.showSnackbar('Form submission updated successfully.', 'success-snackbar');
        return true;
      }),
      catchError(() => {
        this.toolsService.showSnackbar('Form submission could not be updated.', 'error-snackbar');
        return of(false);
      }),
    );
  }

  private submitSubmission$(
    formId: string,
    answers: { fieldId: string; value: any }[],
  ): Observable<boolean> {
    const payload: CreateFormSubmissionRequest = {
      formId,
      answers,
    };

    return this.formApiService.createSubmission(payload).pipe(
      map(() => {
        this.billingApiService.loadOverview();
        this.toolsService.showSnackbar('Form submission created successfully.', 'success-snackbar');
        return true;
      }),
      catchError(() => {
        this.toolsService.showSnackbar('Form submission could not be created.', 'error-snackbar');
        return of(false);
      }),
    );
  }

  private getFormId(): string | null {
    if (!this.form) return null;

    if (this.isFormDefinition(this.form)) {
      return this.form.id ?? null;
    }

    if (this.isFormSubmission(this.form)) {
      return this.form.formId;
    }

    return null;
  }

  private base64ToFile(base64: string, fileName: string): File {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  }

  private normalizeAnswerValue(value: any): string | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    return String(value);
  }

  private isFormDefinition(
    form: FormDefinition | FormSubmission | undefined,
  ): form is FormDefinition {
    return !!form && 'ownerUserId' in form;
  }

  isFormSubmission(form: FormDefinition | FormSubmission | undefined): form is FormSubmission {
    return !!form && 'createdByUserId' in form;
  }

  private normalizeFormValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeFormValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, this.normalizeFormValue(val)]),
      );
    }

    if (value === '') {
      return null;
    }

    return value;
  }

  private hasFormChanged(): boolean {
    const currentValue = this.normalizeFormValue(this.myGroup.getRawValue());
    const initialValue = this.normalizeFormValue(this.initialFormValue);

    return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
  }

  private captureInitialFormValue(): void {
    this.initialFormValue = this.myGroup.getRawValue();
    this.myGroup.markAsPristine();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pageActionService.clearActionsByOwner(this.pageOwner);
  }
}
