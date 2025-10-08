// TypeScript
import {Component, inject, HostListener} from '@angular/core';
import {RouterModule, Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StyleClassModule} from 'primeng/styleclass';
import {AppConfigurator} from './app.configurator';
import {LayoutService} from '../service/layout.service';
import {MenuItem} from 'primeng/api';
import {LanguageSelectComponent} from '@/shared/i18n/language-select.component';
import {AuthService} from '@/pages/auth/auth-service';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, LanguageSelectComponent],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="title">
                        <title>Señorita Brasil – selo</title>
                        <circle cx="27" cy="20" r="18" stroke="var(--primary-color)" stroke-width="3"/>
                        <circle cx="27" cy="20" r="14.2" stroke="var(--primary-color)" stroke-width="0.9"/>
                        <defs>
                            <path id="leaf"
                                  d="M27 7.5c.95 0 1.95.33 2.23 1.15c-.33 1.07-1.63 2.12-2.23 2.32c-.6-.2-1.9-1.25-2.23-2.32C25.05 7.83 26.05 7.5 27 7.5Z"
                                  fill="var(--primary-color)"/>
                        </defs>
                        <g>
                            <use href="#leaf" transform="rotate(  0 27 20)"/>
                            <use href="#leaf" transform="rotate( 15 27 20)"/>
                            <use href="#leaf" transform="rotate( 30 27 20)"/>
                            <use href="#leaf" transform="rotate( 45 27 20)"/>
                            <use href="#leaf" transform="rotate( 60 27 20)"/>
                            <use href="#leaf" transform="rotate( 75 27 20)"/>
                            <use href="#leaf" transform="rotate( 90 27 20)"/>
                            <use href="#leaf" transform="rotate(105 27 20)"/>
                            <use href="#leaf" transform="rotate(120 27 20)"/>
                            <use href="#leaf" transform="rotate(135 27 20)"/>
                            <use href="#leaf" transform="rotate(150 27 20)"/>
                            <use href="#leaf" transform="rotate(165 27 20)"/>
                            <use href="#leaf" transform="rotate(180 27 20)"/>
                            <use href="#leaf" transform="rotate(195 27 20)"/>
                            <use href="#leaf" transform="rotate(210 27 20)"/>
                            <use href="#leaf" transform="rotate(225 27 20)"/>
                            <use href="#leaf" transform="rotate(240 27 20)"/>
                            <use href="#leaf" transform="rotate(255 27 20)"/>
                            <use href="#leaf" transform="rotate(270 27 20)"/>
                            <use href="#leaf" transform="rotate(285 27 20)"/>
                            <use href="#leaf" transform="rotate(300 27 20)"/>
                            <use href="#leaf" transform="rotate(315 27 20)"/>
                            <use href="#leaf" transform="rotate(330 27 20)"/>
                            <use href="#leaf" transform="rotate(345 27 20)"/>
                        </g>
                        <g fill="var(--primary-color)" text-anchor="middle">
                            <text x="27" y="18.2" font-size="5" font-weight="700"
                                  font-family="Georgia, 'Times New Roman', serif">Señorita
                            </text>
                            <text x="27" y="24.8" font-size="6"
                                  font-family="'Brush Script MT', 'Segoe Script', cursive">Brasil
                            </text>
                        </g>
                    </svg>
                    <span>Señorita Brasil</span>
                </a>
            </div>

            <div class="layout-topbar-actions">

                <div class="layout-config-menu">

                    <language-select class="ml-2"></language-select>

                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>

                    <div class="relative">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                            aria-label="Theme"
                            title="Theme"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator/>
                    </div>

                </div>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next"
                        enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <!--                    <button type="button" class="layout-topbar-action">-->
                        <!--                        <i class="pi pi-calendar"></i>-->
                        <!--                        <span>Calendar</span>-->
                        <!--                    </button>-->
                        <!--                    <button type="button" class="layout-topbar-action">-->
                        <!--                        <i class="pi pi-inbox"></i>-->
                        <!--                        <span>Messages</span>-->
                        <!--                    </button>-->

                        <!-- Botão Profile com menu suspenso (apenas se logado) -->
                        @if (auth.loggedIn) {
                            <div class="relative" (click)="$event.stopPropagation()">
                                <button
                                    type="button"
                                    class="layout-topbar-action"
                                    (click)="toggleProfileMenu($event)"
                                    [attr.aria-expanded]="profileMenuOpen"
                                    aria-haspopup="menu"
                                    title="Perfil"
                                >
                                    <i class="pi pi-user"></i>
                                    <span>Profile</span>
                                </button>

                                <!-- Dropdown -->
                                <div
                                    class="absolute right-0 top-full mt-2 w-72 bg-surface-0 dark:bg-surface-900 shadow-2 border rounded"
                                    [class.hidden]="!profileMenuOpen"
                                    role="menu"
                                    (click)="$event.stopPropagation()"
                                >
                                    <div class="p-4 border-bottom-1 surface-border">
                                        <div class="font-semibold text-surface-900 dark:text-surface-0">
                                            {{ auth.user?.username || auth.user?.email }}
                                        </div>
                                        <div class="text-muted-color text-sm">
                                            {{ auth.user?.role }}
                                        </div>
                                    </div>
                                    <a
                                        routerLink="/usuario/perfil"
                                        class="flex items-center gap-2 p-3 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                                        (click)="onProfileMenuItemClick($event)"
                                        role="menuitem"
                                    >
                                        <i class="pi pi-id-card"></i>
                                        <span>Ver Perfil do Usuário</span>
                                    </a>

                                    <div class="border-top-1 surface-border"></div>

                                    <button
                                        type="button"
                                        class="w-full text-left flex items-center gap-2 p-3 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"
                                        (click)="onLogoutClick($event)"
                                        role="menuitem"
                                    >
                                        <i class="pi pi-sign-out"></i>
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                        }
                        <!-- Fim Profile -->
                    </div>
                </div>

            </div>
        </div>`
    ,
    styles: [`
        .layout-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem 1rem;
            gap: 0.75rem;
            flex-wrap: nowrap;
        }

        .layout-topbar-logo-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .layout-topbar-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-left: auto;
        }

        @media (max-width: 768px) {
            .layout-topbar {
                flex-direction: column;
                align-items: stretch;
            }
            .layout-topbar-logo-container {
                order: 1;
                width: 100%;
            }
            .layout-topbar-actions {
                order: 2;
                width: 100%;
                justify-content: flex-end;
                margin-top: 0.5rem;
            }
        }
    `]
})
export class AppTopbar {
    items!: MenuItem[];
    auth = inject(AuthService);

    profileMenuOpen = false;

    constructor(public layoutService: LayoutService, private router: Router) {
        // Fecha o menu ao navegar
        this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
            this.profileMenuOpen = false;
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({...state, darkTheme: !state.darkTheme}));
    }

    toggleProfileMenu(event: MouseEvent) {
        event.stopPropagation();
        this.profileMenuOpen = !this.profileMenuOpen;
    }

    onProfileMenuItemClick(event: MouseEvent) {
        event.stopPropagation();
        this.profileMenuOpen = false;
    }

    async onLogoutClick(event: MouseEvent) {
        event.stopPropagation();
        this.profileMenuOpen = false;
        await this.auth.logOut();
    }

    // Fecha ao clicar fora
    @HostListener('document:click')
    closeOnOutsideClick() {
        if (this.profileMenuOpen) {
            this.profileMenuOpen = false;
        }
    }
}
