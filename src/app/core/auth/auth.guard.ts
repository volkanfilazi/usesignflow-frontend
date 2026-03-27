import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (authState.hasSession()) {
    return true;
  }

  sessionStorage.setItem('returnUrl', state.url);

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
