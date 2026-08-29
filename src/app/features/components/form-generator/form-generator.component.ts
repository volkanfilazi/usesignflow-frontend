import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsApiService } from '../../../shared/services/form-api.service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolsService } from '../../../shared/services/tools.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { PageActionService } from '../../../shared/services/header/page-action.service';
import {
  AssignedTo,
  AssignedToEnum,
  AssignedToOptions,
  BuilderItem,
  ComboboxOption,
  FIELD_CONFIG,
  FieldDefinition,
  FieldType,
  FieldTypes,
  FormDefinition,
  FormElementsEnum,
  options,
} from '../../../shared/models/form-generator.mode';
import { MatDialog } from '@angular/material/dialog';
import { AgreementListComponent } from '../../../shared/components/agreement/agreement-list/agreement-list.component';
import { FormPreviewDialogComponent } from '../../../shared/components/dialogs/form-preview-dialog/form-preview-dialog.component';
import { BillingApiService } from '../../../shared/services/billing-api-service';
import { EditMode } from '../../../shared/models/auth.model';
import { SnapshotTrackedComponent } from '../../../shared/class/snapshot-tracked';

@Component({
  selector: 'app-form-generator',
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss'],
  standalone: false,
})
export class FormGeneratorComponent
  extends SnapshotTrackedComponent<{
    form: unknown;
    builderItems: unknown[];
  }>
  implements OnDestroy, OnInit
{
  protected override buildSnapshot(): { form: unknown; builderItems: unknown[] } {
    return {
      form: this.myGroup.getRawValue(),
      builderItems: this.builderItems,
    };
  }

  protected override getForm(): AbstractControl | null {
    return this.myGroup;
  }

  saveBeforeLeave(): Observable<boolean> {
    return this.persistBeforeLeave(this.editMode);
  }

  private readonly destroy$ = new Subject<void>();

  editMode = EditMode.CREATE;
  formById: FormDefinition | undefined;
  loading$ = new BehaviorSubject<boolean>(false);
  builderItems: BuilderItem[] = [];
  myGroup!: FormGroup;
  FormElementsEnum = FormElementsEnum;
  FieldTypes = FieldTypes;
  fieldOptions: ComboboxOption[] = options.map((type) => ({
    value: type,
    label: FIELD_CONFIG[type].label,
  }));
  assignedToOptions: AssignedTo[] = [...AssignedToOptions];
  validationErrors: ValidationIssue[] | undefined;
  requiredCheckboxLabel = 'Required';
  pageOwner = 'form-generator';
  collapsedMap: Record<string, boolean> = {};

  toolbarItems: { icon: string; name: string; type: FieldType }[] = [
    { icon: 'short_text', name: 'Short Text', type: FieldTypes.ShortText },
    { icon: 'notes', name: 'Long Text', type: FieldTypes.LongText },
    { icon: 'alternate_email', name: 'Email', type: FieldTypes.Email },
    { icon: 'tag', name: 'Number', type: FieldTypes.Number },
    { icon: 'arrow_drop_down_circle', name: 'Dropdown', type: FieldTypes.Dropdown },
    { icon: 'check_box', name: 'Checkbox', type: FieldTypes.Checkbox },
    { icon: 'draw', name: 'Signature', type: FieldTypes.Signature },
  ];

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private readonly pageActionService: PageActionService,
    private readonly matDialog: MatDialog,
    private readonly billingApi: BillingApiService,
    private readonly route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.pageActionService.clearActions();
    this.setActions();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const formId = params.get('formId');
      const mode = params.get('mode') as EditMode;

      if (!formId) {
        this.myGroup.enable({ emitEvent: false });
        this.captureInitialState();

        return;
      }

      if (mode) {
        this.editMode = mode;
        this.pageActionService.clearActions();
        this.setActions(this.editMode);
      }

      this.formApiService.getFormById(formId).subscribe({
        next: (response: any) => {
          this.formById = response;

          this.resetDynamicFields();

          const normalizedFields = response?.fields ?? response?.Fields ?? [];
          const normalizedFormName = response?.formName ?? response?.FormName ?? '';
          const normalizedExpanded = response?.expanded ?? response?.Expanded ?? false;
          const normalizedRequiresVerification =
            response?.requiresVerification ?? response?.requiresVerification ?? false;
          const normalizedVersion = response?.version ?? response?.Version ?? '';
          const normalizedAgreementContentHtml = response?.agreementContentHtml;

          this.loadFieldsFromApi(normalizedFields);

          this.myGroup.patchValue({
            formName: normalizedFormName,
            expanded: normalizedExpanded,
            requiresVerification: normalizedRequiresVerification,
            version: normalizedVersion,
            agreementContentHtml: normalizedAgreementContentHtml,
          });

          if (this.editMode === EditMode.VIEW) {
            this.myGroup.disable({ emitEvent: false });
          } else {
            this.myGroup.enable({ emitEvent: false });
          }

          this.captureInitialState();
        },
        error: (err) => {
          console.error(err);
        },
      });
    });
  }

  private buildForm() {
    this.myGroup = new FormGroup({
      formName: new FormControl(''),
      expanded: new FormControl(false),
      version: new FormControl(''),
      requiresVerification: new FormControl(false),
      agreementContentHtml: new FormControl(''),
    });
  }

  private resetDynamicFields() {
    this.builderItems = [];
    this.collapsedMap = {};

    Object.keys(this.myGroup.controls).forEach((key) => {
      const isBaseControl = [
        'formName',
        'expanded',
        'version',
        'requiresVerification',
        'agreementContentHtml',
      ].includes(key);
      if (!isBaseControl) {
        this.myGroup.removeControl(key);
      }
    });
  }

  isDisabled() {
    return this.editMode !== EditMode.CREATE && this.editMode !== EditMode.EDIT;
  }

  private setActions(editMode: EditMode = EditMode.CREATE) {
    if (editMode !== EditMode.VIEW) {
      this.pageActionService.addAction({
        id: 'show-preview',
        iconName: 'visibility',
        iconTooltip: 'preview before create or update',
        owner: this.pageOwner,
        handler: () => this.previewForm(),
      });

      if (editMode === EditMode.CREATE) {
        this.pageActionService.addAction({
          id: 'save-ui',
          text: 'Save',
          owner: this.pageOwner,
          handler: () => this.create(),
        });
      } else {
        this.pageActionService.addAction({
          id: 'save-ui',
          text: 'Save',
          owner: this.pageOwner,
          handler: () => this.update(),
        });
      }
    } else {
      this.pageActionService.addAction({
        id: 'save-ui',
        text: 'Edit',
        owner: this.pageOwner,
        handler: () => this.edit(),
      });
    }
  }

  private loadFieldsFromApi(fields: any[], disabled = false) {
    if (!Array.isArray(fields) || !fields.length) return;

    fields.forEach((field: any) => {
      const id = field?.fieldId ?? field?.FieldId;
      const type = (field?.type ?? field?.Type) as FieldType;

      if (!id || !type) {
        return;
      }

      if (type === FieldTypes.Agreement) {
        const agreement = field?.agreement ?? field?.Agreement;

        this.builderItems.push({
          type: FieldTypes.Agreement,
          id,
          agreement,
        });

        this.collapsedMap[id] = false;
        return;
      }

      this.addDynamicField(id, type, field, false, disabled);
    });
  }

  get dynamicFormIds(): string[] {
    return this.builderItems
      .filter((item): item is { type: 'Field'; id: string } => item.type === 'Field')
      .map((item) => item.id);
  }

  createNewControl(type: FieldType = FieldTypes.ShortText) {
    const uniqueId = uuidv4();
    this.addDynamicField(uniqueId, type, undefined, true);
  }

  addAgreement() {
    const dialogRef = this.matDialog.open(AgreementListComponent, {
      width: '600px',
      height: '80%',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const randomID = uuidv4();

      this.builderItems.push({
        type: FieldTypes.Agreement,
        id: randomID,
        agreement: confirmed,
      });

      this.collapsedMap[randomID] = false;
      this.scrollToTheElement(randomID);
    });
  }

  getDynamicControlName(prefix: FormElementsEnum, id: string): string {
    return `${prefix}${id}`;
  }

  removeElement(id: string) {
    Object.keys(this.myGroup.controls)
      .filter((controlName) => controlName.endsWith(id))
      .forEach((controlName) => this.myGroup.removeControl(controlName));

    this.builderItems = this.builderItems.filter(
      (item) => !(item.type === 'Field' && item.id === id),
    );

    delete this.collapsedMap[id];
  }

  removeAgreement(id: string) {
    this.builderItems = this.builderItems.filter(
      (item) => !(item.type === FieldTypes.Agreement && item.id === id),
    );

    delete this.collapsedMap[id];
  }

  duplicateElement(id: string) {
    const uniqueId = uuidv4();

    const controlsToCopy = [
      FormElementsEnum.Required,
      FormElementsEnum.Type,
      FormElementsEnum.AssignedTo,
      FormElementsEnum.ValidationMin,
      FormElementsEnum.ValidationMax,
      FormElementsEnum.ValidationMinLength,
      FormElementsEnum.ValidationMaxLength,
      FormElementsEnum.Label,
      FormElementsEnum.ColSpan,
    ];

    controlsToCopy.forEach((key) => {
      const oldControl = this.myGroup.get(key + id);
      const oldValue = oldControl?.value ?? null;
      this.myGroup.addControl(key + uniqueId, new FormControl(oldValue));
    });

    if (this.myGroup.get(FormElementsEnum.SelectOptions + id)) {
      const oldOptions = this.myGroup.get(FormElementsEnum.SelectOptions + id)?.value;

      this.myGroup.addControl(
        FormElementsEnum.SelectOptions + uniqueId,
        new FormControl(Array.isArray(oldOptions) ? [...oldOptions] : oldOptions),
      );
    }

    const currentIndex = this.builderItems.findIndex(
      (item) => item.type === 'Field' && item.id === id,
    );

    this.builderItems.splice(currentIndex + 1, 0, {
      type: 'Field',
      id: uniqueId,
    });

    this.builderItems = [...this.builderItems];
    this.collapsedMap[uniqueId] = false;
    this.scrollToTheElement(uniqueId);
  }

  toggleCollapse(id: string) {
    this.collapsedMap[id] = !this.collapsedMap[id];
  }

  isCollapsed(id: string): boolean {
    return !!this.collapsedMap[id];
  }

  addSelectOptionsConrol(id: string) {
    this.myGroup.addControl(FormElementsEnum.SelectOptions + id, new FormControl([]));
  }

  drop(event: CdkDragDrop<BuilderItem[]>) {
    moveItemInArray(this.builderItems, event.previousIndex, event.currentIndex);
    this.builderItems = [...this.builderItems];
  }

  comboboxChanged(id: string, value: string) {
    if (value === FieldTypes.Dropdown) {
      if (!this.myGroup.get(FormElementsEnum.SelectOptions + id)) {
        this.addSelectOptionsConrol(id);
      }
      return;
    }

    if (this.myGroup.get(FormElementsEnum.SelectOptions + id)) {
      this.myGroup.removeControl(FormElementsEnum.SelectOptions + id);
    }
  }

  returnFormValue(formName: string) {
    return this.myGroup.get(formName)?.value;
  }

  edit() {
    if (this.formById && this.formById.id) {
      this.myGroup.enable({ emitEvent: false });
      this.router.navigate(['/dashboard/form-generator/', this.formById.id, EditMode.EDIT]);
    }
  }

  update() {
    this.persistBeforeLeave(EditMode.EDIT).subscribe((success) => {
      if (!success) {
        return;
      }

      this.router.navigate(['/dashboard/forms']);
    });
  }

  create() {
    this.persistBeforeLeave(EditMode.CREATE).subscribe((success) => {
      if (!success) {
        return;
      }

      this.router.navigate(['/dashboard/forms']);
    });
  }

  private buildFormPayload(): FormDefinition {
    const fields: FieldDefinition[] = this.builderItems
      .map((item) => {
        if (item.type === 'Field') {
          const id = item.id;
          const type = this.myGroup.get(FormElementsEnum.Type + id)?.value as FieldType;
          const assignedToValue = this.myGroup.get(FormElementsEnum.AssignedTo + id)
            ?.value as AssignedTo;

          return {
            fieldId: id,
            label: this.myGroup.get(FormElementsEnum.Label + id)?.value,
            type,
            min: this.returnFormValue(FormElementsEnum.ValidationMin + id),
            max: this.returnFormValue(FormElementsEnum.ValidationMax + id),
            minLength: this.returnFormValue(FormElementsEnum.ValidationMinLength + id),
            maxLength: this.returnFormValue(FormElementsEnum.ValidationMaxLength + id),
            assignedTo: assignedToValue ?? 'You',
            required: this.myGroup.get(FormElementsEnum.Required + id)?.value ?? false,
            colSpan: Number(this.myGroup.get(FormElementsEnum.ColSpan + id)?.value),
            options: this.myGroup.get(FormElementsEnum.SelectOptions + id)?.value,
          } as FieldDefinition;
        }

        if (item.type === FieldTypes.Agreement) {
          return {
            fieldId: item.id,
            label: item.agreement.title,
            type: FieldTypes.Agreement,
            required: true,
            assignedTo: 'Client' as AssignedTo,
            colSpan: 4,
            agreement: item.agreement,
          } as FieldDefinition;
        }

        return null;
      })
      .filter((field): field is FieldDefinition => field !== null);

    return {
      formName: this.myGroup.get('formName')?.value,
      version: this.myGroup.get('version')?.value,
      requiresVerification: this.myGroup.get('requiresVerification')?.value,
      agreementContentHtml: this.myGroup.get('agreementContentHtml')?.value,
      expanded: this.myGroup.get('expanded')?.value ?? false,
      fields,
    } as FormDefinition;
  }

  expandAll() {
    const newMap: Record<string, boolean> = {};
    this.builderItems.forEach((item) => {
      newMap[item.id] = false;
    });
    this.collapsedMap = newMap;
  }

  collapseAll() {
    const newMap: Record<string, boolean> = {};
    this.builderItems.forEach((item) => {
      newMap[item.id] = true;
    });
    this.collapsedMap = newMap;
  }

  hasCollapsed(): boolean {
    return this.builderItems.some((item) => this.collapsedMap[item.id]);
  }

  hasExpanded(): boolean {
    return this.builderItems.some((item) => !this.collapsedMap[item.id]);
  }

  previewForm() {
    const previewData = this.buildFormPayload();

    if (!previewData.fields.length) {
      this.toolsService.showSnackbar('Please enter at least one form element.', 'info-snackbar');
      return;
    }

    this.matDialog.open(FormPreviewDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '95vw',
      data: previewData,
    });
  }

  private scrollToTheElement(id: string) {
    setTimeout(() => {
      document
        .querySelector(`[data-field-id="${id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  addFieldByType(type: FieldType) {
    this.createNewControl(type);
  }

  private mapAssignedToFromApi(value: number | string | null | undefined): AssignedTo {
    if (value === AssignedToEnum.Client || value === 'Client' || value === 'client') {
      return 'Client';
    }

    return 'You';
  }

  private addDynamicField(
    id: string,
    type: FieldType,
    field?: any,
    shouldScroll = false,
    disabled = false,
  ) {
    const config = FIELD_CONFIG[type];

    if (!id || !config) {
      console.error('Invalid dynamic field:', { id, type, field });
      return;
    }

    this.builderItems.push({
      type: 'Field',
      id,
    });

    this.myGroup.addControl(
      FormElementsEnum.Required + id,
      new FormControl({
        value: field?.required ?? field?.Required ?? config.required ?? false,
        disabled,
      }),
    );

    this.myGroup.addControl(
      FormElementsEnum.Type + id,
      new FormControl({ value: field?.type ?? field?.Type ?? type, disabled }),
    );

    this.myGroup.addControl(
      FormElementsEnum.AssignedTo + id,
      new FormControl({
        value: this.mapAssignedToFromApi(field?.assignedTo ?? field?.AssignedTo),
        disabled,
      }),
    );

    this.myGroup.addControl(
      FormElementsEnum.ValidationMin + id,
      new FormControl({ value: field?.min ?? field?.Min ?? null, disabled }),
    );

    this.myGroup.addControl(
      FormElementsEnum.ValidationMax + id,
      new FormControl({ value: field?.max ?? field?.Max ?? null, disabled }),
    );

    this.myGroup.addControl(
      FormElementsEnum.ValidationMinLength + id,
      new FormControl({ value: field?.minLength ?? field?.MinLength ?? null, disabled }),
    );

    this.myGroup.addControl(
      FormElementsEnum.ValidationMaxLength + id,
      new FormControl({ value: field?.maxLength ?? field?.MaxLength ?? null, disabled }),
    );

    this.myGroup.addControl(
      FormElementsEnum.Label + id,
      new FormControl({ value: field?.label ?? field?.Label ?? config.label, disabled }, [
        Validators.required,
      ]),
    );

    this.myGroup.addControl(
      FormElementsEnum.ColSpan + id,
      new FormControl({
        value: String(field?.colSpan ?? field?.ColSpan ?? config.colSpan),
        disabled,
      }),
    );

    if (type === FieldTypes.Dropdown) {
      this.myGroup.addControl(
        FormElementsEnum.SelectOptions + id,
        new FormControl(
          { value: field?.options ?? field?.Options ?? [], disabled },
          Validators.required,
        ),
      );
    }

    this.collapsedMap[id] = false;

    if (shouldScroll) {
      this.scrollToTheElement(id);
    }
  }

  private persistBeforeLeave(mode: EditMode): Observable<boolean> {
    const valid = this.isValid();

    if (!valid) {
      return of(false);
    }

    const formDefinition = this.buildFormPayload();

    let request$: Observable<unknown>;
    let successMessage: string;
    let errorMessage: string;

    if (mode === EditMode.CREATE) {
      request$ = this.formApiService.createForm(formDefinition);
      successMessage = 'Form created successfully.';
      errorMessage = 'Form could not be created.';
    } else {
      if (!this.formById?.id) {
        return of(false);
      }

      request$ = this.formApiService.updateForm(this.formById.id, formDefinition);
      successMessage = 'Form updated successfully.';
      errorMessage = 'Form could not be updated.';
    }

    this.loading$.next(true);

    return request$.pipe(
      map(() => {
        this.captureInitialState();
        this.billingApi.loadOverview();
        this.toolsService.showSnackbar(successMessage, 'success-snackbar');
        return true;
      }),
      catchError(() => {
        this.toolsService.showSnackbar(errorMessage, 'error-snackbar');
        return of(false);
      }),
      finalize(() => {
        this.loading$.next(false);
      }),
    );
  }

  private isValid() {
    this.validationErrors = [];

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.myGroup);
      return false;
    }

    if (this.builderItems.length === 0) {
      this.toolsService.showSnackbar('Please enter at least one form element.', 'success-snackbar');
      return false;
    }

    if (!this.hasPendingChanges()) {
      this.toolsService.showSnackbar('No changes', 'error-snackbar');

      return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.pageActionService.clearActionsByOwner(this.pageOwner);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
