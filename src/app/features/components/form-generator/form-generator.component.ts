import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  AssignedToOptions,
  CreateFormDefinitionRequest,
  FieldDefinition,
  FormAssignedTo,
  FormElementsEnum,
  FormFieldType,
  options,
} from '../../../shared/models/form-generator.mode';
import { MatDialog } from '@angular/material/dialog';
import { AgreementListComponent } from '../../../shared/components/agreement/agreement-list/agreement-list.component';
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
  assignedToOptions: FormAssignedTo[] = [...AssignedToOptions];
  validationErrors: ValidationIssue[] | undefined;
  requiredCheckboxLabel = 'Required';

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
      handler: () => this.createNewControl(),
    });

    this.pageActionService.addAction({
      id: 'add-agreement',
      text: 'Add agreement',
      handler: () => this.addAgreement(),
    });

    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Create',
      handler: () => this.create(),
    });
  }

  get dynamicFormIds(): string[] {
    return this.builderItems
      .filter((item): item is { type: 'field'; id: string } => item.type === 'field')
      .map((item) => item.id);
  }

  createNewControl() {
    const uniqueId = uuidv4();

    this.builderItems.push({
      type: 'field',
      id: uniqueId,
    });

    this.myGroup.addControl(FormElementsEnum.Required + uniqueId, new FormControl());
    this.myGroup.addControl(
      FormElementsEnum.Type + uniqueId,
      new FormControl(this.fieldOptions[0]),
    );
    this.myGroup.addControl(
      FormElementsEnum.AssignedTo + uniqueId,
      new FormControl(this.assignedToOptions[0]),
    );
    this.myGroup.addControl(FormElementsEnum.ValidationMin + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMax + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMinLength + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ValidationMaxLength + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.Label + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.ColSpan + uniqueId, new FormControl('4'));

    this.scrollToTheElement(uniqueId);
  }

  private addAgreement() {
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
  }

  removeAgreement(id: string) {
    this.builderItems = this.builderItems.filter(
      (item) => !(item.type === 'agreement' && item.id === id),
    );
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

    this.scrollToTheElement(uniqueId);
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

  assignedToComboboxChanged(id: string, value: string) {
    if (value === 'external') {
      this.requiredCheckboxLabel = 'Required for external user';
    } else {
      this.requiredCheckboxLabel = 'Required';
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

    if (this.dynamicFormIds.length == 0) {
      this.toolsService.showSnackbar('Please enter at least one form element.', 'success-snackbar');

      return;
    }

    this.loading$.next(true);

    const fields: FieldDefinition[] = this.builderItems
      .map((item) => {
        if (item.type === 'field') {
          const id = item.id;
          const type = this.myGroup.get(FormElementsEnum.Type + id)?.value;

          console.log('FIELD DEBUG', {
            id,
            label: this.myGroup.get(FormElementsEnum.Label + id)?.value,
            type: this.myGroup.get(FormElementsEnum.Type + id)?.value,
            required: this.myGroup.get(FormElementsEnum.Required + id)?.value,
            assignedTo: this.myGroup.get(FormElementsEnum.AssignedTo + id)?.value,
          });

          return {
            fieldId: id,
            label: this.myGroup.get(FormElementsEnum.Label + id)?.value,
            type,
            min: this.returnFormValue('min' + id),
            max: this.returnFormValue('max' + id),
            minLength: this.returnFormValue('minLength' + id),
            maxLength: this.returnFormValue('maxLength' + id),
            assignedTo: this.myGroup.get(FormElementsEnum.AssignedTo + id)?.value ?? false,
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
            assignedTo: 'external' as AssignedTo,
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

  private scrollToTheElement(id: string) {
    setTimeout(() => {
      document
        .querySelector(`[data-field-id="${id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  ngOnDestroy(): void {
    this.pageActionService.clearActions();
  }
}
