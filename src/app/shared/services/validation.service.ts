import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Constants } from '../models/constants';
import { FieldDefinition, FieldTypes } from '../models/form-generator.mode';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  requiredArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!Array.isArray(value) || value.length === 0) {
        return { required: true };
      }

      return null;
    };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('passwordConfirm')?.value;

    if (!password || !confirm) {
      return null;
    }

    if (password !== confirm) {
      return { passMatch: true };
    }

    return null;
  }

  static passwordPatternValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) return null;

      return Constants.passwordRegex.test(value)
        ? null
        : {
            passwordPattern: {
              message:
                'The password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.',
            },
          };
    };
  }

  buildValidators(field: FieldDefinition, includeRequired = true): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required && includeRequired) {
      validators.push(Validators.required);
    }

    switch (field.type) {
      case FieldTypes.Email:
        validators.push(Validators.email);

        if (field.minLength != null) {
          validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength != null) {
          validators.push(Validators.maxLength(field.maxLength));
        }
        break;

      case FieldTypes.Number:
        if (field.min != null) {
          validators.push(Validators.min(field.min));
        }

        if (field.max != null) {
          validators.push(Validators.max(field.max));
        }
        break;

      case FieldTypes.ShortText:
      case FieldTypes.LongText:
        if (field.minLength != null) {
          validators.push(Validators.minLength(field.minLength));
        }

        if (field.maxLength != null) {
          validators.push(Validators.maxLength(field.maxLength));
        }
        break;
    }

    if (field.pattern) {
      validators.push(Validators.pattern(field.pattern));
    }

    return validators;
  }

  collectValidationIssues(
    formGroup: FormGroup,
    fieldLabelMap?: Record<string, string>,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);
      if (!control?.errors) return;

      const label = (fieldLabelMap && fieldLabelMap[controlName]) ?? controlName;
      const errors = control.errors;

      const pushIssue = (key: string, message: string) => {
        issues.push({
          key,
          message,
          controlName,
          elementId: controlName,
        });
      };

      if (errors['required']) {
        pushIssue('required', `(${label}) field is required`);
      }

      if (errors['email']) {
        pushIssue('email', `(${label}) must be a valid email address.`);
      }

      if (errors['minlength']) {
        pushIssue(
          'minlength',
          `(${label}) must be at least ${errors['minlength'].requiredLength} characters. Current length: ${errors['minlength'].actualLength}.`,
        );
      }

      if (errors['maxlength']) {
        pushIssue(
          'maxlength',
          `(${label}) must be at most ${errors['maxlength'].requiredLength} characters. Current length: ${errors['maxlength'].actualLength}.`,
        );
      }

      if (errors['min']) {
        pushIssue(
          'min',
          `(${label}) must be greater than or equal to ${errors['min'].min}. Current value: ${errors['min'].actual}.`,
        );
      }

      if (errors['max']) {
        pushIssue(
          'max',
          `(${label}) must be less than or equal to ${errors['max'].max}. Current value: ${errors['max'].actual}.`,
        );
      }

      if (errors['passwordPattern']) {
        pushIssue(
          'passwordPattern',
          errors['passwordPattern'].message || `(${label}) password format is invalid.`,
        );
      }

      if (errors['pattern']) {
        pushIssue('pattern', `(${label}) format is invalid.`);
      }
    });

    if (formGroup.errors?.['passMatch']) {
      issues.push({
        key: 'passMatch',
        message: 'Passwords did not match',
        controlName: 'passwordConfirm',
        elementId: 'passwordConfirm',
      });
    }

    return issues;
  }
}
