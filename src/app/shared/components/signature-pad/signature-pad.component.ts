import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import SignaturePad from 'signature_pad';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  standalone: false,
})
export class SignaturePadComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() controlName!: string;
  @Input() disabled = false;
  @Input() isRequired = false;
  @Input() label: string | undefined;
  @Input() assignee: 'you' | 'client' = 'you';
  @Input() badgeName: string | undefined;

  @ViewChild('signatureCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private loadVersion = 0;
  private signaturePad!: SignaturePad;
  private readonly destroy$ = new Subject<void>();
  private baseUrl = environment.apiBaseUrl;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.resizeCanvas();

    this.signaturePad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 2.5,
      penColor: 'black',
    });

    this.signaturePad.addEventListener('endStroke', () => {
      if (this.disabled) return;
      this.updateFormValue();
    });

    this.applyDisabledState();
    this.bindControlValue();
    void this.loadExistingValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.signaturePad) return;

    if (changes['disabled']) {
      this.applyDisabledState();
    }

    if (changes['controlName']) {
      void this.loadExistingValue();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private bindControlValue(): void {
    const control = this.formGroup?.get(this.controlName);
    if (!control) return;

    control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      void this.loadExistingValue();
    });
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const parentWidth = canvas.parentElement?.clientWidth ?? 500;
    const height = 200;

    canvas.width = parentWidth * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${parentWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }
  }

  private applyDisabledState(): void {
    if (!this.signaturePad) return;

    if (this.disabled) {
      this.signaturePad.off();
    } else {
      this.signaturePad.on();
    }
  }

  private async loadExistingValue(): Promise<void> {
    const currentVersion = ++this.loadVersion;
    const value = this.formGroup?.get(this.controlName)?.value;

    if (!this.signaturePad) return;

    this.signaturePad.clear();

    if (!value || typeof value !== 'string') {
      return;
    }

    try {
      let dataUrl = value;

      if (!value.startsWith('data:image')) {
        const absoluteUrl = this.toAbsoluteUrl(value);
        dataUrl = await this.urlToDataUrl(absoluteUrl);
      }

      if (currentVersion !== this.loadVersion) {
        return;
      }

      requestAnimationFrame(() => {
        if (currentVersion !== this.loadVersion) return;
        this.signaturePad.clear();
        this.signaturePad.fromDataURL(dataUrl, {
          width: this.canvasRef.nativeElement.clientWidth || 500,
          height: this.canvasRef.nativeElement.clientHeight || 200,
        });
      });
    } catch (err) {
      console.error('Signature image could not be loaded:', value, err);
    }
  }

  private async urlToDataUrl(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private toAbsoluteUrl(value: string): string {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    return `${environment.fileBaseUrl}${value}`;
  }

  private updateFormValue(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.formGroup.get(this.controlName)?.setValue(null);
      return;
    }

    const base64 = this.signaturePad.toDataURL('image/png');
    this.formGroup.get(this.controlName)?.setValue(base64, { emitEvent: false });
    this.formGroup.get(this.controlName)?.markAsTouched();
    this.formGroup.get(this.controlName)?.updateValueAndValidity();
  }

  clear(): void {
    if (this.disabled) return;

    this.signaturePad.clear();
    this.formGroup.get(this.controlName)?.setValue(null);
    this.formGroup.get(this.controlName)?.markAsTouched();
    this.formGroup.get(this.controlName)?.updateValueAndValidity();
  }
}
