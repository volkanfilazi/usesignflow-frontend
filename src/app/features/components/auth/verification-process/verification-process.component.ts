import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { take } from 'rxjs/operators';

type VerifyStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verification-process',
  templateUrl: './verification-process.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./verification-process.component.scss'],
})
export class VerificationProcessComponent implements OnInit {
  status: VerifyStatus = 'loading';
  title = 'Verifying your email...';
  message = 'Please wait while we confirm your email address.';
  email: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const token = params.get('token');
      const email = params.get('email');

      this.email = email;

      if (!token || !email) {
        this.status = 'error';
        this.title = 'Invalid verification link';
        this.message = 'The verification link is incomplete or invalid. Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { verified: false },
          });
        }, 1800);

        return;
      }

      this.http
        .get(
          `${environment.apiBaseUrl}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
        )
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.status = 'success';
            this.title = 'Email verified successfully';
            this.message = 'Your account is now active. Redirecting you to the login page...';

            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { verified: true },
              });
            }, 1400);
          },
          error: (err) => {
            this.status = 'error';
            this.title = 'Verification failed';
            this.message =
              'This verification link is invalid, expired, or has already been used. Redirecting to login...';

            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { verified: false },
              });
            }, 1800);
          },
        });
    });
  }
}
