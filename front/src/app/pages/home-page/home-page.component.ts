// TypeScript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <section class="px-4 sm:px-6 lg:px-8 py-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-0 mb-4">
            Bem-vindo(a) ao Sistema
          </h1>
          <p class="text-surface-600 dark:text-surface-300 text-base sm:text-lg leading-relaxed mb-6">
            Esta é a sua página inicial. Aqui você poderá acessar rapidamente os recursos do sistema.
          </p>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/presente/erro" class="inline-flex items-center px-5 py-3 rounded-md bg-primary text-white hover:opacity-90 transition">
              Ver exemplo
            </a>
            <a routerLink="/" class="inline-flex items-center px-5 py-3 rounded-md border border-surface-300 dark:border-surface-700 text-surface-900 dark:text-surface-0 hover:bg-surface-100 dark:hover:bg-surface-800 transition">
              Página inicial
            </a>
          </div>
        </div>

        <div class="w-full">
          <img
            class="w-full h-auto rounded-xl shadow-2"
            src="https://primefaces.org/cdn/templates/sakai/auth/asset-dashboard.svg"
            alt="Dashboard ilustrativo"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent {}
