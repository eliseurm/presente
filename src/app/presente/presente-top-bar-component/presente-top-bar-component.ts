// TypeScript
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '@/layout/component/app.configurator';
import { LanguageSelectComponent } from '@/shared/i18n/language-select.component';
import { LayoutService } from '@/layout/service/layout.service';

@Component({
    selector: 'app-presente-topbar',
    standalone: true,
    imports: [CommonModule, RouterModule, StyleClassModule, AppConfigurator, LanguageSelectComponent],
    templateUrl: './presente-top-bar-component.html',
    styleUrl: './presente-top-bar-component.scss'
})
export class PresenteTopbarComponent {
    @Input() nome: string | null = null;

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
