import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {
  private route = inject(ActivatedRoute);
  resending = false;

  email = this.route.snapshot.queryParamMap.get('email') ?? '';

  resendEmail() {
    this.resending = true;

    // API çağrısı burada
    setTimeout(() => {
      this.resending = false;
    }, 1200);
  }
}
