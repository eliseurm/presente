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

                <a class="layout-topbar-logo" routerLink="/home">
                    <span class="logo-icon"></span>
                    <span>Señorita Brasil</span>
                </a>


                <!--
                                <a class="layout-topbar-logo" routerLink="/home">
                                    <img src="assets/images/selo-senorita-brasil.svg" alt="Señorita Brasil – selo" />
                                    <span>Señorita Brasil</span>
                                </a>
                -->

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
