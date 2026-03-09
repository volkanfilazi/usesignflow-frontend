import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

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

  collectValidationIssues(formGroup: FormGroup): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    console.log('formGroup errors:', formGroup.errors);

    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);

      if (!control) return;

      if (control.errors?.['required']) {
        issues.push({
          key: 'required',
          message: `(${controlName}) field is required`,
          controlName,
          elementId: controlName,
        });
      }

      if (control.errors?.['email']) {
        issues.push({
          key: 'email',
          message: 'Geçerli bir e-posta adresi giriniz.',
          controlName,
          elementId: controlName,
        });
      }

      if (control.errors?.['minlength']) {
        issues.push({
          key: 'minlength',
          message: 'Minimum karakter sayısı sağlanmadı.',
          controlName,
          elementId: controlName,
        });
      }

      if (control.errors?.['pattern']) {
        issues.push({
          key: 'pattern',
          message:
            'Password must contain uppercase, lowercase, number, special character and be at least 10 characters.',
          controlName,
          elementId: controlName,
        });
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
