import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-verification-code-input',
  templateUrl: './verification-code-input.component.html',
  styleUrl: './verification-code-input.component.scss',
  standalone: false,
})
export class VerificationCodeInputComponent {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @Output() codeCompleted = new EventEmitter<string>();
  @Input() codeType = '2FA'

  codeArray = Array(6).fill(0);
  code: string[] = ['', '', '', '', '', ''];

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');

    if (!value) {
      this.code[index] = '';
      input.value = '';
      return;
    }

    this.code[index] = value[0];
    input.value = value[0];

    if (index < 5) {
      this.focusInput(index + 1);
    }

    this.emitIfComplete();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (input.value) {
        this.code[index] = '';
        input.value = '';
        return;
      }

      if (index > 0) {
        this.code[index - 1] = '';
        this.focusInput(index - 1);
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';

    if (!pasted) return;

    for (let i = 0; i < 6; i++) {
      this.code[i] = pasted[i] ?? '';
    }

    this.codeInputs.forEach((inputRef, i) => {
      inputRef.nativeElement.value = this.code[i];
    });

    const nextIndex = Math.min(pasted.length, 5);
    this.focusInput(nextIndex);

    this.emitIfComplete();
  }

  focusInput(index: number): void {
    const input = this.codeInputs.get(index)?.nativeElement;
    input?.focus();
    input?.select();
  }

  private emitIfComplete(): void {
    if (this.code.every((x) => x !== '')) {
      this.codeCompleted.emit(this.code.join(''));
    }
  }

  reset(): void {
    this.code = ['', '', '', '', '', ''];

    this.codeInputs?.forEach((inputRef) => {
      inputRef.nativeElement.value = '';
    });

    this.focusInput(0);
  }
}
