import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { AuthApiService } from '../services/auth-api.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  console.log('token', token)
  if (!token) return request;

  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/verify-email') ||
    url.includes('/auth/resend-verification')
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const authApi = inject(AuthApiService);

  const accessToken = authState.getToken();

  const authReq = isAuthEndpoint(req.url) ? req : addToken(req, accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      const refreshToken = authState.getRefreshToken();
      const email = authState.getEmail();

      if (!refreshToken || !email) {
        authState.logout();
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authApi.refreshToken({ email, refreshToken }).pipe(
          switchMap((response) => {
            isRefreshing = false;

            authState.setSession(response.token, response.refreshToken);
            refreshTokenSubject.next(response.token);

            const retryReq = addToken(req, response.token);
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            authState.logout();
            return throwError(() => refreshError);
          }),
        );
      }

      return refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => {
          const retryReq = addToken(req, token);
          return next(retryReq);
        }),
      );
    }),
  );
};
