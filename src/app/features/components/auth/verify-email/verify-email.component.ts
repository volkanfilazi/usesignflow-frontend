import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {
  private route = inject(ActivatedRoute);

  resending = new BehaviorSubject(false);
  email = this.route.snapshot.queryParamMap.get('email') ?? '';

  constructor(private readonly authApiService: AuthApiService) {}

  resendEmail() {
    this.resending.next(true);
    this.authApiService.resendVerification(this.email).subscribe({
      next: () => {
        this.resending.next(false);
      },
      error: (err) => {
        console.error('Error resending verification email:', err);
        this.resending.next(false);
      },
    });
  }
}
