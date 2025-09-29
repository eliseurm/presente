// TypeScript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LangPipe } from '@/shared/i18n/lang-pipe';
import { LanguageSelectComponent } from '@/shared/i18n/language-select.component';
import { AuthService } from '@/pages/auth/auth-service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        AppFloatingConfigurator,
        LangPipe,
        LanguageSelectComponent
    ],
    template: `
    <app-floating-configurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
      <div class="flex flex-col items-center justify-center">
        <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
          <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
            <div class="flex justify-end mb-4">
              <language-select></language-select>
            </div>

            <div class="text-center mb-8">
              <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                <!-- SVG -->
              </svg>
              <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ 'login.welcome' | lang }}</div>
              <span class="text-muted-color font-medium">{{ 'login.subtitle' | lang }}</span>
            </div>

            <form (ngSubmit)="signIn()" autocomplete="on">
              <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ 'login.email' | lang }}</label>
              <input
                pInputText
                id="email1"
                type="email"
                [placeholder]="'login.emailPlaceholder' | lang"
                class="w-full md:w-120 mb-8"
                [(ngModel)]="email"
                name="email"
                [disabled]="loading"
                required
              />

              <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ 'login.password' | lang }}</label>
              <p-password
                id="password1"
                [(ngModel)]="password"
                name="password"
                [placeholder]="'login.passwordPlaceholder' | lang"
                [toggleMask]="true"
                styleClass="mb-4"
                [fluid]="true"
                [feedback]="false"
                [disabled]="loading"
                required
              ></p-password>

              <div class="flex items-center justify-between mt-2 mb-4 gap-8">
                <div class="flex items-center">
                  <p-checkbox [(ngModel)]="checked" id="rememberme1" name="rememberMe" binary class="mr-2"></p-checkbox>
                  <label for="rememberme1">{{ 'login.rememberMe' | lang }}</label>
                </div>
                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">{{ 'login.forgotPassword' | lang }}</span>
              </div>

              <small class="text-red-500 block mb-4" *ngIf="error">{{ error }}</small>

              <p-button
                [label]="'login.signIn' | lang"
                styleClass="w-full"
                [loading]="loading"
                [disabled]="loading || !email || !password"
                type="submit"
              ></p-button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Login {
    private auth = inject(AuthService);

    email = '';
    password = '';
    checked = false;

    loading = false;
    error = '';

    async signIn() {
        this.error = '';
        this.loading = true;
        const result = await this.auth.logIn(this.email, this.password, this.checked);
        if (!result.isOk) {
            this.error = result.message || 'Não foi possível autenticar.';
            this.loading = false;
        }
    }
}
