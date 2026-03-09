import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { FormElementsEnum, options } from '../../../shared/models/formType';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormDefinitionDto } from '../../../shared/models/form-generator.mode';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToolsService } from '../../../shared/services/tools.service';
import { ValidationService } from '../../../shared/services/validation.service';

@Component({
  selector: 'app-form-generator',
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss'],
  standalone: false,
})
export class FormGeneratorComponent {
  loading$ = new BehaviorSubject<boolean>(false);
  myGroup: FormGroup;
  FormElementsEnum = FormElementsEnum;
  options = options;
  dynamicFormIds: string[] = [];
  validationErrors: ValidationIssue[] | undefined;

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly router: Router,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService
  ) {
    this.myGroup = new FormGroup({
      formName: new FormControl(),
      expanded: new FormControl(),
      version: new FormControl(),
    });

    this.myGroup.get('formName')?.valueChanges.subscribe((value) => {});
  }

  createNewControl() {
    const uniqueId = uuidv4();
    this.dynamicFormIds.push(uniqueId);

    this.myGroup.addControl(FormElementsEnum.DynamicFormRequired + uniqueId, new FormControl());
    this.myGroup.addControl(
      FormElementsEnum.DynamicFormType + uniqueId,
      new FormControl(this.options[0]),
    );
    this.myGroup.addControl(FormElementsEnum.DynamicFormLabel + uniqueId, new FormControl());
    this.myGroup.addControl(FormElementsEnum.DynamicFormColSpan + uniqueId, new FormControl('4'));
  }

  addSelectOptionsConrol(id: string) {
    this.myGroup.addControl(FormElementsEnum.DynamicFormSelectOptions + id, new FormControl());
  }

  formExtractor(formName: string) {
    if (formName.includes(FormElementsEnum.DynamicFormRequired)) {
      return FormElementsEnum.DynamicFormRequired;
    }

    if (formName.includes(FormElementsEnum.DynamicFormType)) {
      return FormElementsEnum.DynamicFormType;
    }

    if (formName.includes(FormElementsEnum.DynamicFormLabel)) {
      return FormElementsEnum.DynamicFormLabel;
    }

    if (formName.includes(FormElementsEnum.DynamicFormColSpan)) {
      return FormElementsEnum.DynamicFormColSpan;
    }

    return '';
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dynamicFormIds, event.previousIndex, event.currentIndex);
    this.dynamicFormIds = [...this.dynamicFormIds];
  }

  comboboxChanged(id: string, value: string) {
    if (value === 'Select') {
      this.addSelectOptionsConrol(id);
    } else {
      if (this.myGroup.get(FormElementsEnum.DynamicFormSelectOptions + id)) {
        this.myGroup.removeControl(FormElementsEnum.DynamicFormSelectOptions + id);
      }
    }
  }

  create() {
    this.validationErrors = [];

    if (this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(this.myGroup);

      return;
    }

    this.loading$.next(true);

    const formDefinition: FormDefinitionDto = {
      id: '',
      formName: this.myGroup.get('formName')?.value,
      version: this.myGroup.get('version')?.value,
      expanded: this.myGroup.get('expanded')?.value ?? false,
      ownerUserId: '',
      fields: this.dynamicFormIds.map((id) => ({
        fieldId: id,
        label: this.myGroup.get(FormElementsEnum.DynamicFormLabel + id)?.value,
        type: this.myGroup.get(FormElementsEnum.DynamicFormType + id)?.value,
        required: this.myGroup.get(FormElementsEnum.DynamicFormRequired + id)?.value ?? false,
        colSpan: this.myGroup.get(FormElementsEnum.DynamicFormColSpan + id)?.value,
        options: this.myGroup.get(FormElementsEnum.DynamicFormSelectOptions + id)?.value,
      })),
    };

    this.formApiService.createForm(formDefinition).subscribe({
      next: () => {
        setTimeout(() => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Form created successfully.', 'success-snackbar');
          this.router.navigate(['/genericformlist']);
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
}
