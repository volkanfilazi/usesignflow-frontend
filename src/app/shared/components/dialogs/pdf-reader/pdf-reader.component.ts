import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from "../../../shared.module";

@Component({
  templateUrl: './pdf-reader.component.html',
  standalone: true,
  imports: [SharedModule],
})
export class PdfReaderDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PdfReaderDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { pdfUrl: string },
  ) {}

  close() {
    this.dialogRef.close();
  }
}
