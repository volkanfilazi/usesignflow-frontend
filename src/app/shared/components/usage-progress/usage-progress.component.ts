import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-usage-progress',
  templateUrl: './usage-progress.component.html',
  styleUrl: './usage-progress.component.scss',
  standalone: false,
})
export class UsageProgressComponent {
  @Input() used = 0;
  @Input() limit = 100;
  @Input() showText = false;
  @Input() compact = false;

  get percent(): number {
    if (!this.limit || this.limit <= 0) return 0;
    return Math.min(100, Math.max(0, (this.used / this.limit) * 100));
  }

  get variant(): 'default' | 'warning' | 'danger' {
    if (this.percent >= 95) return 'danger';
    if (this.percent >= 80) return 'warning';
    return 'default';
  }
}
