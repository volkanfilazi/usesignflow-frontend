import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

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
  isSubmissionEditable,
  options,
  UpdateFormSubmissionRequest,
} from '../../../shared/models/form-generator.mode';

@Component({
  selector: 'app-dynamic-form-renderer',
  templateUrl: './dynamic-form-renderer.component.html',
  styleUrl: './dynamic-form-renderer.component.scss',
  standalone: false,
})
export class DynamicFormRendererComponent implements OnInit, OnDestroy {
  @Input() previewForm: FormDefinition | undefined;

  buildingForm = true;
  loading$ = new BehaviorSubject(false);
  myGroup = new FormGroup({});
  form: FormDefinition | FormSubmission | undefined;
  elementOptions = options;
  validationErrors: ValidationIssue[] | undefined;
  fieldLabelMap: Record<string, string> = {};
  currentUserId = '';
  externalUserToken = '';
  mode: 'create' | 'submission' | 'preview' = 'create';
  isSignaturePadDisabled = false;
  submissinTitle = '';
  pageOwner = 'dynamic-form-renderer';

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
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId() ?? '';

    if (this.previewForm) {
      this.mode = 'preview';
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
        this.mode = 'create';
        this.configurePageAction();
        this.loadForm(formId);

        return;
      }

      if (submissionId) {
        this.mode = 'submission';
        this.configurePageAction();
        this.loadSubmission(submissionId, this.externalUserToken ?? undefined);
      }
    });
  }

  private resetState(): void {
    this.buildingForm = true;
    this.validationErrors = [];
    this.fieldLabelMap = {};
    this.myGroup = new FormGroup({});
  }

  private configurePageAction(): void {
    this.pageActionService.addAction({
      id: 'save-ui',
      text: this.mode === 'create' ? 'Create' : 'Update',
      owner: this.pageOwner,
      handler: () => (this.mode === 'create' ? this.create() : this.update()),
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
      .getSubmissionById(submissionId, accessToken ?? undefined)
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

  private loadPreviewForm(previewForm: any): void {
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
    };

    this.buildFormControls(undefined, this.getFields());
    this.finishBuild();
  }

  private finishBuild(): void {
    this.buildingForm = false;
    this.cdr.detectChanges();
  }

  private buildFormControls(
    submission: FormSubmission | undefined,
    fields: FieldDefinition[],
    answers?: { fieldId: string; value: any }[],
  ): void {
    fields.forEach((field) => {
      this.fieldLabelMap[field.fieldId] = field.label;

      if (field.type === 'agreement') {
        const controlName = field.fieldId;

        const rawValue = answers?.find((x) => x.fieldId === field.fieldId)?.value;
        const existingValue = rawValue === true || rawValue === 'true';

        this.myGroup.addControl(
          controlName,
          new FormControl(
            {
              value: existingValue,
              disabled: (submission && !isSubmissionEditable(submission)) || this.isDisabled(field),
            },
            field.required ? Validators.requiredTrue : [],
          ),
        );

        return;
      }

      const validators = this.buildFieldValidators(field);
      const rawValue = answers?.find((x) => x.fieldId === field.fieldId)?.value;

      const existingValue =
        field.type === 'checkbox' ? rawValue === true || rawValue === 'true' : (rawValue ?? null);

      this.isSignaturePadDisabled = (submission && !isSubmissionEditable(submission)) ?? false;
      this.submissinTitle = submission?.formName ?? '';

      this.myGroup.addControl(
        field.fieldId,
        new FormControl(
          {
            value: existingValue,
            disabled: (submission && !isSubmissionEditable(submission)) || this.isDisabled(field),
          },
          validators,
        ),
      );
    });

    this.captureInitialFormValue();
  }

  private buildFieldValidators(field: FieldDefinition): ValidatorFn[] {
    return this.validationService.buildValidators(field, this.shouldValidateField(field));
  }

  getFields(): FieldDefinition[] {
    if (!this.form) return [];

    if (this.mode === 'preview' && this.isFormDefinition(this.form)) {
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
    if (!this.isDisabled(field)) {
      return field.label;
    }

    const assignedTo = field.assignedTo ?? 'Owner';
    const reservedFor = assignedTo === 'Owner' ? 'owner' : 'external user';

    return `${field.label} - (Reserved for ${reservedFor})`;
  }

  isOwnerUser(): boolean {
    if (!this.form) return false;

    if (this.isFormDefinition(this.form)) {
      return this.form.ownerUserId === this.currentUserId;
    }

    if (this.isFormSubmission(this.form)) {
      return this.form.createdByUserId === this.currentUserId;
    }

    return false;
  }

  isFieldAssignedToCurrentUser(field: FieldDefinition): boolean {
    const assignedToOwner = (field.assignedTo ?? 'Owner') === 'Owner';
    return this.isOwnerUser() === assignedToOwner;
  }

  getFormTitle(): string {
    if (!this.form) return '';

    if (this.isFormDefinition(this.form)) {
      return this.form.formName;
    }

    if (this.isFormSubmission(this.form)) {
      let status = this.form.status;
      return `Submission: ${this.submissinTitle}${status ? ' - ' + status : ''}`;
    }

    return '';
  }

  isDisabled(field: FieldDefinition): boolean {
    return !this.isFieldAssignedToCurrentUser(field);
  }

  shouldValidateField(field: FieldDefinition): boolean {
    return this.isFieldAssignedToCurrentUser(field);
  }

  create(): void {
    this.validationErrors = [];

    if (!this.form || !this.myGroup) return;

    const formId = this.getFormId();
    if (!formId) return;

    this.myGroup.updateValueAndValidity();

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(
        this.myGroup,
        this.fieldLabelMap,
      );
      return;
    }

    this.loading$.next(true);

    const fields = this.getFields();
    const signatureField = fields.find((x) => x.type === 'signaturePad');
    const signatureValue = signatureField ? this.myGroup.get(signatureField.fieldId)?.value : null;

    const answers = fields.map((field) => ({
      fieldId: field.fieldId,
      value: this.normalizeAnswerValue(
        this.myGroup.get(this.getAnswerControlName(field))?.value ?? null,
      ),
    }));

    if (signatureField && this.isBase64Image(signatureValue)) {
      this.uploadSignatureAndCreate(signatureField.fieldId, signatureValue, answers, formId);
      return;
    }

    this.submitSubmission(formId, answers);
  }

  update(): void {
    this.validationErrors = [];

    if (!this.form || !this.myGroup) return;
    if (!this.isFormSubmission(this.form)) return;

    this.myGroup.updateValueAndValidity();

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(
        this.myGroup,
        this.fieldLabelMap,
      );
      return;
    }

    if (!this.hasFormChanged()) {
      this.toolsService.showSnackbar('No changes', 'error-snackbar');

      return;
    }

    this.loading$.next(true);

    const fields = this.getFields();
    const signatureField = fields.find((x) => x.type === 'signaturePad');
    const signatureValue = signatureField ? this.myGroup.get(signatureField.fieldId)?.value : null;

    const answers = fields.map((field) => ({
      fieldId: field.fieldId,
      value: this.normalizeAnswerValue(
        this.myGroup.get(this.getAnswerControlName(field))?.value ?? null,
      ),
    }));

    if (signatureField && this.isBase64Image(signatureValue)) {
      this.uploadSignatureAndUpdate(
        signatureField.fieldId,
        signatureValue,
        answers,
        this.form.rowVersion,
      );
      return;
    }

    this.updateSubmission(this.form.rowVersion, answers);
  }

  private isBase64Image(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('data:image');
  }

  private uploadSignatureAndCreate(
    signatureFieldId: string,
    signatureBase64: string,
    answers: { fieldId: string; value: any }[],
    formId: string,
  ): void {
    const file = this.base64ToFile(signatureBase64, 'signature.png');
    this.formApiService
      .uploadSignature(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uploadRes) => {
          const finalAnswers = answers.map((answer) =>
            answer.fieldId === signatureFieldId ? { ...answer, value: uploadRes.url } : answer,
          );

          this.submitSubmission(formId, finalAnswers);
        },
        error: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Signature could not be uploaded.', 'error-snackbar');
        },
      });
  }

  private uploadSignatureAndUpdate(
    signatureFieldId: string,
    signatureBase64: string,
    answers: { fieldId: string; value: any }[],
    rowVersion: number,
  ): void {
    const file = this.base64ToFile(signatureBase64, 'signature.png');
    const accessToken = this.route.snapshot.queryParamMap.get('token');
    this.formApiService
      .uploadSignature(file, accessToken ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uploadRes) => {
          const finalAnswers = answers.map((answer) =>
            answer.fieldId === signatureFieldId ? { ...answer, value: uploadRes.url } : answer,
          );

          this.updateSubmission(rowVersion, finalAnswers);
        },
        error: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Signature could not be uploaded.', 'error-snackbar');
        },
      });
  }

  private getAnswerControlName(field: FieldDefinition): string {
    return field.fieldId;
  }

  private updateSubmission(rowVersion: number, answers: { fieldId: string; value: any }[]): void {
    if (!this.form?.id) return;

    const payload: UpdateFormSubmissionRequest = {
      answers,
      rowVersion,
    };

    if (this.externalUserToken) {
      this.formApiService
        .updateSubmissionByAccessToken(this.form.id, {
          token: this.externalUserToken,
          rowVersion: rowVersion,
          answers,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'The document has been successfully completed.',
              'success-snackbar',
            );
            this.router.navigate(['submission-access', this.form?.id!, 'completed'], {
              state: { token: this.externalUserToken! },
            });
          },
          error: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'The document could not be completed.',
              'error-snackbar',
            );
          },
        });
    } else {
      this.formApiService
        .updateSubmission(this.form.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'Form submission updated successfully.',
              'success-snackbar',
            );
            this.router.navigate(['/dashboard/submissions']);
          },
          error: () => {
            this.loading$.next(false);
            this.toolsService.showSnackbar(
              'Form submission could not be updated.',
              'error-snackbar',
            );
          },
        });
    }
  }

  private submitSubmission(formId: string, answers: { fieldId: string; value: any }[]): void {
    const payload: CreateFormSubmissionRequest = {
      formId,
      answers,
    };

    this.formApiService
      .createSubmission(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar(
            'Form submission created successfully.',
            'success-snackbar',
          );
          this.router.navigate(['/dashboard/submissions']);
        },
        error: () => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Form submission could not be created.', 'error-snackbar');
        },
      });
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

  private isFormSubmission(
    form: FormDefinition | FormSubmission | undefined,
  ): form is FormSubmission {
    return !!form && 'createdByUserId' in form;
  }

  private hasFormChanged(): boolean {
    const currentValue = this.myGroup.getRawValue();

    return JSON.stringify(currentValue) !== JSON.stringify(this.initialFormValue);
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
