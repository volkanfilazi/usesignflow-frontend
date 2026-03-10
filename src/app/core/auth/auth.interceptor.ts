import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';
import { AuthApiService } from '../services/auth-api.service';
import { catchError, switchMap, throwError } from 'rxjs';

function addToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return request;

  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login')
    || url.includes('/auth/register')
    || url.includes('/auth/refresh')
    || url.includes('/auth/verify-email')
    || url.includes('/auth/resend-verification');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const authApi = inject(AuthApiService);

  const accessToken = authState.getToken();

  const authReq = isAuthEndpoint(req.url)
    ? req
    : addToken(req, accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        isAuthEndpoint(req.url)
      ) {
        return throwError(() => error);
      }

      const refreshToken = authState.getRefreshToken();
      const email = authState.getEmail();

      if (!refreshToken || !email) {
        authState.logout();
        return throwError(() => error);
      }

      return authApi.refreshToken({
        email,
        refreshToken
      }).pipe(
        switchMap((response) => {
          authState.setSession(response.token, response.refreshToken);

          const retryReq = addToken(req, response.token);
          return next(retryReq);
        }),
        catchError((refreshError) => {
          authState.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};