import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-google-callback',
  template: `<p>Signing you in...</p>`,
})
export class GoogleCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authState: AuthStateService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.router.navigate(['/login']);
        return;
      }

      const token = params['token'];
      const refreshToken = params['refreshToken'];

      let returnUrl = params['returnUrl'] || sessionStorage.getItem('returnUrl') || '/dashboard';

      if (!returnUrl.startsWith('/')) {
        returnUrl = '/dashboard';
      }

      if (token && refreshToken) {
        this.authState.setSession(token, refreshToken);
        sessionStorage.removeItem('returnUrl');
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
