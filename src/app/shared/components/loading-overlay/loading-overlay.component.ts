import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.scss'],
})
export class AuthLoadingOverlayComponent {
  @Input() visible = false;
  @Input() title = 'Please wait...';
  @Input() message = 'Your request is being processed.';
}