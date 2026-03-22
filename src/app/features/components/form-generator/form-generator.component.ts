import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToolsService } from '../../../shared/services/tools.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { PageActionService } from '../../../shared/services/page-action.service';
import {
  Agreements,
  AssignedTo,
  assignedToMap,
  AssignedToOptions,
  CreateFormDefinitionRequest,
  FIELD_CONFIG,
  FieldDefinition,
  FieldType,
  FormElementsEnum,
  FormFieldType,
  options,
} from '../../../shared/models/form-generator.mode';
import { MatDialog } from '@angular/material/dialog';
import { AgreementListComponent } from '../../../shared/components/agreement/agreement-list/agreement-list.component';
import { FormPreviewDialogComponent } from '../../../shared/components/dialogs/form-preview-dialog/form-preview-dialog.component';
type BuilderItem =
  | { type: 'field'; id: string }
  | { type: 'agreement'; id: string; agreement: Agreements };
@Component({
  selector: 'app-form-generator',
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss'],
  standalone: false,
})
export class FormGeneratorComponent implements OnDestroy {
  loading$ = new BehaviorSubject<boolean>(false);
  builderItems: BuilderItem[] = [];
  myGroup: FormGroup;
  FormElementsEnum = FormElementsEnum;
  fieldOptions: FormFieldType[] = [...options];
  assignedToOptions: AssignedTo[] = [...AssignedToOptions];
  validationErrors: ValidationIssue[] | undefined;
  requiredCheckboxLabel = 'Required';
  pageOwner = 'form-generator';
  collapsedMap: Record<string, boolean> = {};
  toolbarItems: {
    icon: string;
    name: string;
    type: FieldType;
  }[] = [
    {
      icon: 'short_text',
      name: 'Text',
      type: 'text',
    },
    {
      icon: 'alternate_email',
      name: 'Email',
      type: 'email',
    },
    {
      icon: 'tag',
      name: 'Number',
      type: 'number',
    },
    {
      icon: 'arrow_drop_down_circle',
      name: 'Select',
      type: 'select',
    },
    {
      icon: 'check_box',
      name: 'Checkbox',
      type: 'checkbox',
    },
    {
      icon: 'draw',
      name: 'Signature',
      type: 'signaturePad',
    },
  ];

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
    private readonly pageActionService: PageActionService,
    private readonly matDialog: MatDialog,
  ) {
    this.myGroup = new FormGroup({
      formName: new FormControl(),
      expanded: new FormControl(),
      version: new FormControl(),
    });

    this.myGroup.get('formName')?.valueChanges.subscribe((value) => {});
    this.pageActionService.clearActions();

    this.pageActionService.addAction({
      id: 'add',
      text: 'Add new element',
      owner: this.pageOwner,
      handler: () => this.createNewControl(),
    });

    this.pageActionService.addAction({
      id: 'add-agreement',
      text: 'Add agreement',
      owner: this.pageOwner,
      handler: () => this.addAgreement(),
    });

    this.pageActionService.addAction({
      id: 'show-preview',
      text: 'Show preview',
      owner: this.pageOwner,
      handler: () => this.previewForm(),
    });

    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Create',
      owner: this.pageOwner,
      handler: () => this.create(),
    });
  }

  get dynamicFormIds(): string[] {
    return this.builderItems
      .filter((item): item is { type: 'field'; id: string } => item.type === 'field')
      .map((item) => item.id);
  }

  createNewControl(type: FieldType = 'text') {
    const uniqueId = uuidv4();
    const config = FIELD_CONFIG[type];

    this.builderItems.push({
      type: 'field',
      id: uniqueId,
    });

    this.myGroup.addControl(
      FormElementsEnum.Required + uniqueId,
      new FormControl(config.required ?? false),
    );

    this.myGroup.addControl(FormElementsEnum.Type + uniqueId, new FormControl(type));

    this.myGroup.addControl(
      FormElementsEnum.AssignedTo + uniqueId,
      new FormControl(this.assignedToOptions[0]),
    );

    this.myGroup.addControl(FormElementsEnum.ValidationMin + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMax + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMinLength + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMaxLength + uniqueId, new FormControl());

    this.myGroup.addControl(
      FormElementsEnum.Label + uniqueId,
      new FormControl(config.label, [Validators.required]),
    );

    this.myGroup.addControl(FormElementsEnum.ColSpan + uniqueId, new FormControl(config.colSpan));

    if (type === 'select') {
      this.myGroup.addControl(FormElementsEnum.SelectOptions + uniqueId, new FormControl([]));
    }

    this.collapsedMap[uniqueId] = false;

    this.scrollToTheElement(uniqueId);
  }

  addAgreement() {
    const dialogRef = this.matDialog.open(AgreementListComponent, {
      width: '600px',
      height: '70%',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const randomID = uuidv4();
        this.builderItems.push({
          type: 'agreement',
          id: randomID,
          agreement: confirmed,
        });

        this.collapsedMap[randomID] = false;
        this.scrollToTheElement(randomID);
      }
    });
  }

  removeElement(id: string) {
    Object.keys(this.myGroup.controls)
      .filter((controlName) => controlName.endsWith(id))
      .forEach((controlName) => this.myGroup.removeControl(controlName));

    this.builderItems = this.builderItems.filter(
      (item) => !(item.type === 'field' && item.id === id),
    );

    delete this.collapsedMap[id];
  }

  removeAgreement(id: string) {
    this.builderItems = this.builderItems.filter(
      (item) => !(item.type === 'agreement' && item.id === id),
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
      (item) => item.type === 'field' && item.id === id,
    );

    this.builderItems.splice(currentIndex + 1, 0, {
      type: 'field',
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
    this.myGroup.addControl(FormElementsEnum.SelectOptions + id, new FormControl());
  }

  formExtractor(formName: string) {
    if (formName.includes(FormElementsEnum.Required)) {
      return FormElementsEnum.Required;
    }

    if (formName.includes(FormElementsEnum.Type)) {
      return FormElementsEnum.Type;
    }

    if (formName.includes(FormElementsEnum.Label)) {
      return FormElementsEnum.Label;
    }

    if (formName.includes(FormElementsEnum.ColSpan)) {
      return FormElementsEnum.ColSpan;
    }

    return '';
  }

  drop(event: CdkDragDrop<BuilderItem[]>) {
    moveItemInArray(this.builderItems, event.previousIndex, event.currentIndex);
    this.builderItems = [...this.builderItems];
  }

  comboboxChanged(id: string, value: string) {
    if (value === 'select') {
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

  create() {
    this.validationErrors = [];

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.myGroup);

      return;
    }

    if (this.builderItems.length == 0) {
      this.toolsService.showSnackbar('Please enter at least one form element.', 'success-snackbar');

      return;
    }

    this.loading$.next(true);

    const formDefinition = this.buildFieldDefinition();

    this.formApiService.createForm(formDefinition).subscribe({
      next: () => {
        setTimeout(() => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Form created successfully.', 'success-snackbar');
          this.router.navigate(['/dashboard/forms']);
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

  private buildFieldDefinition() {
    const fields: FieldDefinition[] = this.builderItems
      .map((item) => {
        if (item.type === 'field') {
          const id = item.id;
          const type = this.myGroup.get(FormElementsEnum.Type + id)?.value;
          const assignedToValue = this.myGroup.get(FormElementsEnum.AssignedTo + id)
            ?.value as AssignedTo;

          return {
            fieldId: id,
            label: this.myGroup.get(FormElementsEnum.Label + id)?.value,
            type,
            min: this.returnFormValue(FormElementsEnum.ValidationMin + id),
            max: this.returnFormValue(FormElementsEnum.ValidationMax + id),
            minLength: this.returnFormValue(FormElementsEnum.ValidationMaxLength + id),
            maxLength: this.returnFormValue(FormElementsEnum.ValidationMinLength + id),
            assignedTo: assignedToValue ?? 'You',
            required: this.myGroup.get(FormElementsEnum.Required + id)?.value ?? false,
            colSpan: Number(this.myGroup.get(FormElementsEnum.ColSpan + id)?.value),
            options: this.myGroup.get(FormElementsEnum.SelectOptions + id)?.value,
          } as FieldDefinition;
        }

        if (item.type === 'agreement') {
          return {
            fieldId: item.id,
            label: item.agreement.title,
            type: 'agreement',
            required: true,
            assignedTo: 'client' as AssignedTo,
            colSpan: 4,
            agreement: item.agreement,
          } as FieldDefinition;
        }

        return null;
      })
      .filter((field): field is FieldDefinition => field !== null);

    const formDefinition: CreateFormDefinitionRequest = {
      formName: this.myGroup.get('formName')?.value,
      version: this.myGroup.get('version')?.value,
      expanded: this.myGroup.get('expanded')?.value ?? false,
      fields,
    };

    return formDefinition;
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
    const previewData = this.buildFieldDefinition();
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

  ngOnDestroy(): void {
    this.pageActionService.clearActionsByOwner(this.pageOwner);
  }
}
