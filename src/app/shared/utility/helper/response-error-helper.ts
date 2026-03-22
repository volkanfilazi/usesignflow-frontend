import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred.';
  }

  const payload = error.error;

  if (!payload) {
    return getDefaultStatusMessage(error.status);
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.code === 'string') {
      switch (payload.code) {
        case 'VALIDATION_ERROR':
          return 'Email and password are required.';

        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password.';

        case 'PASSWORD_LOGIN_NOT_AVAILABLE':
          return 'This account cannot be used with password login. Please use one of your linked sign-in methods or set a password first.';

        case 'USE_EXTERNAL_LOGIN':
          return 'Please sign in with one of your linked providers or set a password first.';

        case 'EMAIL_NOT_VERIFIED':
          return 'Please verify your email before logging in.';

        default:
          break;
      }
    }

    if (payload.errors && typeof payload.errors === 'object') {
      const messages: string[] = [];

      for (const key of Object.keys(payload.errors)) {
        const value = payload.errors[key];

        if (Array.isArray(value)) {
          messages.push(...value.filter((x) => typeof x === 'string'));
        } else if (typeof value === 'string') {
          messages.push(value);
        }
      }

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    if (payload.title && typeof payload.title === 'string' && !payload.errors) {
      return payload.title;
    }

    if (payload.message && typeof payload.message === 'string') {
      return payload.message;
    }
  }

  return getDefaultStatusMessage(error.status);
}

function getDefaultStatusMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Server is unreachable.';
    case 400:
      return 'Invalid request.';
    case 401:
      return 'Invalid email or password.';
    case 403:
      return 'You do not have permission for this action.';
    case 404:
      return 'Requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}