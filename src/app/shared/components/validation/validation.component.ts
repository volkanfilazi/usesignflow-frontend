import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss',
  standalone: false,
})
export class ValidationComponent {
  @Input() validationMessages: ValidationIssue[] | undefined;
  @Input() myGroup: FormGroup | undefined;

  isMinimized = false;

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  focus(item: ValidationIssue) {
    if (!item.elementId) return;

    const element = document.getElementById(item.elementId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      (element as HTMLElement).focus();

      element.classList.add('focus-highlight');

      setTimeout(() => {
        element.classList.remove('focus-highlight');
      }, 1500);
    }
  }
}
