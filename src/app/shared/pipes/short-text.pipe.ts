import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortText',
  standalone: true
})
export class ShortTextPipe implements PipeTransform {
  transform(text: string | null | undefined, limit: number = 60): string {
    if (!text) return '';
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  }
}
