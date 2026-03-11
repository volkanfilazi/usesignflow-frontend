import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred.';
  }

  const payload = error.error;

  if (!payload) {
    return 'An unexpected error occurred.';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.title && typeof payload.title === 'string' && !payload.errors) {
    return payload.title;
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const messages: string[] = [];

    for (const key of Object.keys(payload.errors)) {
      const value = payload.errors[key];

      if (Array.isArray(value)) {
        messages.push(...value);
      } else if (typeof value === 'string') {
        messages.push(value);
      }
    }

    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  switch (error.status) {
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