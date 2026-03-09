import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  standalone: false
})
export class SignaturePadComponent implements AfterViewInit {
  @Input() formGroup!: FormGroup;
  @Input() controlName!: string;
  @Input() label: string | undefined;

  @ViewChild('signatureCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private signaturePad!: SignaturePad;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.resizeCanvas();

    this.signaturePad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 2.5,
      penColor: 'black',
    });

    this.signaturePad.addEventListener('endStroke', () => {
      this.updateFormValue();
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

  private updateFormValue(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.formGroup.get(this.controlName)?.setValue(null);
      return;
    }

    const base64 = this.signaturePad.toDataURL('image/png');
    this.formGroup.get(this.controlName)?.setValue(base64);
    this.formGroup.get(this.controlName)?.markAsTouched();
    this.formGroup.get(this.controlName)?.updateValueAndValidity();
  }

  clear(): void {
    this.signaturePad.clear();
    this.formGroup.get(this.controlName)?.setValue(null);
    this.formGroup.get(this.controlName)?.markAsTouched();
    this.formGroup.get(this.controlName)?.updateValueAndValidity();
  }
}