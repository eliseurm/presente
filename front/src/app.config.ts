import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { I18nService } from '@/shared/i18n/i18n-service';
import {authInterceptor} from "@/pages/auth/auth.interceptor";
import { AuthService } from '@/pages/auth/auth-service';

function initI18n() {
    const i18n = inject(I18nService);
    return () => i18n.init();
}

function initAuth() {
    const auth = inject(AuthService);
    return () => auth.restore();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        // provideHttpClient(withFetch()),
        provideHttpClient(withInterceptors([authInterceptor] as any)),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        { provide: APP_INITIALIZER, useFactory: initI18n, multi: true },
        { provide: APP_INITIALIZER, useFactory: initAuth, multi: true }
    ]
};

// export const appConfig: ApplicationConfig = {
//     providers: [
//         provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
//         provideHttpClient(withFetch()),
//         provideAnimationsAsync(),
//         providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
//         { provide: APP_INITIALIZER, useFactory: initI18n, multi: true }
//     ]
// };

