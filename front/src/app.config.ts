import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { I18nService } from '@/shared/i18n/i18n-service';

function initI18n() {
    const i18n = inject(I18nService);
    return () => i18n.init();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        { provide: APP_INITIALIZER, useFactory: initI18n, multi: true }
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

