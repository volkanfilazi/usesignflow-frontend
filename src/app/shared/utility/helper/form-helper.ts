 export function normalizeFormValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeFormValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, normalizeFormValue(val)]),
      );
    }

    if (value === '') {
      return null;
    }

    return value;
  }