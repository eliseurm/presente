// TypeScript
import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '@/shared/i18n/i18n-service';

@Pipe({
    name: 'lang',
    standalone: true,
    pure: false
})
export class LangPipe implements PipeTransform {
    constructor(private i18n: I18nService) {}
    transform(key: string, params?: Record<string, string | number>): string {
        return this.i18n.t(key, params);
    }
}
