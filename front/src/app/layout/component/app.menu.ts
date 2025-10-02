import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {AppMenuitem} from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            @for (item of model; track item.id || $index; let i = $index) {
                @if (!item.separator) {
                    <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                } @else {
                    <li class="menu-separator"></li>
                }
            }
        </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    // Navega direto para a página do presente com uma key de exemplo válida
                    {label: 'Presente', icon: 'pi pi-fw pi-gift', routerLink: ['/presente', 'abc123']},
                    {label: 'Testes', icon: 'pi pi-fw pi-gift', routerLink: ['/teste']},
                ]
            },
            {
                label: 'Cadastros',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {label: 'Pessoa', icon: 'pi pi-fw pi-gift', routerLink: ['/pessoa']},
                    {label: 'Cor', icon: 'pi pi-fw pi-palette', routerLink: ['/cor']},
                ]
            },
        ];
    }
}

