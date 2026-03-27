import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '?';

    const parts = value.trim().split(' ').filter(Boolean);

    if (parts.length === 0) return '?';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[1].charAt(0)
    ).toUpperCase();
  }
}