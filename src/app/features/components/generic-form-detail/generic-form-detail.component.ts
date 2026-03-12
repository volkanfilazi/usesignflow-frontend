import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsApiService } from '../../../shared/services/form-api.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { PageActionService } from '../../../shared/services/page-action.service';
import {
  CreateFormSubmissionRequest,
  FormDefinition,
  options,
} from '../../../shared/models/form-generator.mode';
import { ToolsService } from '../../../shared/services/tools.service';
import { BehaviorSubject } from 'rxjs';
import { ValidationService } from '../../../shared/services/validation.service';

@Component({
  selector: 'app-generic-form-detail',
  templateUrl: './generic-form-detail.component.html',
  styleUrl: './generic-form-detail.component.scss',
  standalone: false,
})
export class GenericFormDetailComponent implements OnDestroy {
  buildingForm = true;
  loading$ = new BehaviorSubject(false);
  myGroup: FormGroup | undefined;
  form: FormDefinition | undefined;
  elementOptions = options;
  validationErrors: ValidationIssue[] | undefined;
  fieldLabelMap: Record<string, string> = {};

  constructor(
    private readonly formApiService: FormsApiService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly pageActionService: PageActionService,
    private readonly toolsService: ToolsService,
    private readonly validationService: ValidationService,
  ) {}

  ngOnInit() {
    this.pageActionService.addAction({
      id: 'save-ui',
      text: 'Create',
      handler: () => this.create(),
    });

    this.myGroup = new FormGroup({});

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.buildingForm = true;
        try {
          this.formApiService.getFormById(id).subscribe((form) => {
            this.form = form;
            this.form?.fields.forEach((element) => {
              this.fieldLabelMap[element.fieldId] = element.label;
              let validators = [];
              validators = this.validationService.buildValidators(element);
              this.myGroup?.addControl(element.fieldId, new FormControl('', validators));
            });

            this.buildingForm = false;
            this.cdr.detectChanges();
          });
        } catch (error) {
          this.buildingForm = false;
        }
      }
    });
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

  create() {
    this.validationErrors = [];

    if (!this.form?.id) {
      return;
    }

    this.myGroup?.updateValueAndValidity();

    if (this.myGroup && this.myGroup.invalid) {
      this.myGroup.markAllAsTouched();
      this.validationErrors = this.validationService.collectValidationIssues(
        this.myGroup,
        this.fieldLabelMap,
      );

      return;
    }

    this.loading$.next(true);

    const signatureField = this.form.fields.find((x) => x.type === 'signaturePad');
    const signatureBase64 = signatureField
      ? this.myGroup?.get(signatureField.fieldId)?.value
      : null;

    if (signatureBase64) {
      const file = this.base64ToFile(signatureBase64, 'signature.png');

      this.formApiService.uploadSignature(file).subscribe((uploadRes) => {
        const answers = this.form!.fields.map((field) => {
          let value = this.myGroup?.get(field.fieldId)?.value ?? null;

          if (field.type === 'signaturePad' && value) {
            value = uploadRes.url;
          }

          return {
            fieldId: field.fieldId,
            value,
          };
        });

        const payload: CreateFormSubmissionRequest = {
          formId: this.form!.id!,
          answers,
        };

        this.formApiService.createSubmission(payload).subscribe({
          next: () => {
            setTimeout(() => {
              this.loading$.next(false);
              this.toolsService.showSnackbar(
                'Form submission created successfully.',
                'success-snackbar',
              );
              //this.router.navigate(['/dashboard/forms']);
            });
          },
          error: () => {
            setTimeout(() => {
              this.loading$.next(false);
              this.toolsService.showSnackbar(
                'Form submission could not be created.',
                'error-snackbar',
              );
            });
          },
        });
      });

      return;
    }

    const answers = this.form.fields.map((field) => ({
      fieldId: field.fieldId,
      value: this.myGroup?.get(field.fieldId)?.value ?? null,
    }));

    const payload: CreateFormSubmissionRequest = {
      formId: this.form.id,
      answers,
    };

    this.formApiService.createSubmission(payload).subscribe({
      next: () => {
        setTimeout(() => {
          this.loading$.next(false);
          this.toolsService.showSnackbar(
            'Form submission created successfully.',
            'success-snackbar',
          );
          //this.router.navigate(['/dashboard/forms']);
        });
      },
      error: () => {
        setTimeout(() => {
          this.loading$.next(false);
          this.toolsService.showSnackbar('Form submission could not be created.', 'error-snackbar');
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.pageActionService.clearActions();
  }
}
