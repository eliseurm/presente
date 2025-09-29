// TypeScript
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { I18nService, LangCode } from '@/shared/i18n/i18n-service';

@Component({
    selector: 'language-select',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    template: `
    <p-select
      [options]="languages"
      [ngModel]="lang()"
      (ngModelChange)="onChange($event)"
      optionLabel="label"
      optionValue="value"
      [showClear]="false"
      appendTo="body"
      styleClass="w-28"
      aria-label="Language"
    ></p-select>
  `
})
export class LanguageSelectComponent {
    private i18n = inject(I18nService);

    languages = [
        { label: 'PT', value: 'pt' as LangCode },
        { label: 'EN', value: 'en' as LangCode },
        { label: 'ES', value: 'es' as LangCode }
    ];

    // Por padrão, o I18nService já define o idioma do navegador
    lang = computed(() => this.i18n.lang());

    async onChange(code: LangCode) {
        await this.i18n.setLang(code);
    }
}



