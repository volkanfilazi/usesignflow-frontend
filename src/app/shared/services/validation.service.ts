import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidationService {
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

  buildValidators(field: any, includeRequired = true): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required && includeRequired) {
      validators.push(Validators.required);
    }

    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    if (field.type === 'number') {
      if (field.min !== null && field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== null && field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }
    }

    if (field.type === 'text' || field.type === 'email') {
      if (field.minLength !== null && field.minLength !== undefined) {
        validators.push(Validators.minLength(field.minLength));
      }

      if (field.maxLength !== null && field.maxLength !== undefined) {
        validators.push(Validators.maxLength(field.maxLength));
      }
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
