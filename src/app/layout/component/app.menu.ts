import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    // Navega direto para a página do presente com uma key de exemplo válida
                    { label: 'Presente', icon: 'pi pi-fw pi-gift', routerLink: ['/presente', 'abc123'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: []
            },
        ];
    }
}

// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MenuItem } from 'primeng/api';
// import { AppMenuitem } from './app.menuitem';
//
// @Component({
//     selector: 'app-menu',
//     standalone: true,
//     imports: [CommonModule, AppMenuitem, RouterModule],
//     template: `<ul class="layout-menu">
//         <ng-container *ngFor="let item of model; let i = index">
//             <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
//             <li *ngIf="item.separator" class="menu-separator"></li>
//         </ng-container>
//     </ul> `
// })
// export class AppMenu {
//     model: MenuItem[] = [];
//
//     ngOnInit() {
//         this.model = [
//             {
//                 label: 'Home',
//                 items: [
//                     { label: 'Presente', icon: 'pi pi-fw pi-gift', routerLink: ['/presente'] }
//                     // { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
//                 ]
//             },
//             {
//                 label: 'Pages',
//                 icon: 'pi pi-fw pi-briefcase',
//                 routerLink: ['/pages'],
//                 items: [
//                     // {
//                     //     label: 'Empty',
//                     //     icon: 'pi pi-fw pi-circle-off',
//                     //     routerLink: ['/pages/empty']
//                     // }
//                 ]
//             },
//         ];
//     }
// }
