import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { I18nService } from '@/shared/i18n/i18n-service';
import { authInterceptor } from '@/pages/auth/auth.interceptor';
import { AuthService } from '@/pages/auth/auth-service';

// --- 1. IMPORTAÇÕES DO LOCALE ---
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt'; // Dados de formatação PT
import localeEs from '@angular/common/locales/es'; // Dados de formatação ES

// --- 2. REGISTRO DOS IDIOMAS ---
// Registramos 'pt' e 'es'. O Inglês ('en-US') já é padrão do Angular.
// O segundo argumento 'pt' garante que o ID seja apenas 'pt' e não 'pt-PT' ou 'pt-BR',
// para bater com a chave usada no seu I18nService.
registerLocaleData(localePt, 'pt');
registerLocaleData(localeEs, 'es');

function initI18n() {
    const i18n = inject(I18nService);
    return () => i18n.init();
}

function initAuth() {
    const auth = inject(AuthService);
    return () => auth.restoreStorage();
}

// --- 3. FÁBRICA PARA DEFINIR O LOCALE INICIAL ---
// Esta função replica a lógica de 'restore()' do seu I18nService para garantir sincronia.
export function localeFactory(): string {
    try {
        const saved = localStorage.getItem('lang');
        if (saved === 'pt' || saved === 'en' || saved === 'es') {
            return saved;
        }
    } catch {}

    const nav = (navigator.language || 'pt').toLowerCase();
    if (nav.startsWith('pt')) return 'pt';
    if (nav.startsWith('es')) return 'es';
    return 'en';
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withInterceptors([authInterceptor] as any)),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),

        { provide: APP_INITIALIZER, useFactory: initI18n, multi: true },
        { provide: APP_INITIALIZER, useFactory: initAuth, multi: true },

        // --- 4. PROVEDOR DO LOCALE_ID ---
        // Isso configura os Pipes (DatePipe, DecimalPipe, CurrencyPipe) globalmente
        { provide: LOCALE_ID, useFactory: localeFactory }
    ]
};
