import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {AppMenuitem} from './app.menuitem';
import { AuthService } from '@/pages/auth/auth-service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            @for (item of model; track item.id || $index; let i = $index) {
                @if (!item.separator) {
                    <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                }
                @else {
                    <li class="menu-separator"></li>
                }
            }
        </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(private auth: AuthService) {}

    ngOnInit() {
        this.model = this.buildMenu();
    }

    private buildMenu(): MenuItem[] {
        const isAdmin = this.auth.isAdmin();
        const isCliente = this.auth.isCliente();
        const isUsuario = this.auth.isUsuario();

        // Seções comuns
        const homeSection: MenuItem = {
            label: 'Home',
            items: [
                { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/home'] },
                // Link público/sem guarda; manter Presente sempre visível
                { label: 'Presente', icon: 'pi pi-fw pi-gift', routerLink: ['/presente', 'abc123'] },
            ]
        };

        // Seção Cadastros varia por papel
        const cadastrosItems: MenuItem[] = [];

        if (isAdmin || isCliente) {
            // Evento e Cliente para ADMIN e CLIENTE
            cadastrosItems.push(
                { label: 'Eventos', icon: 'pi pi-fw pi-sparkles',
                    items: [
                        {label: 'Gestão', icon: 'pi pi-fw pi-list', routerLink: ['/evento']},
                        {label: 'Relatório', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/evento/relatorio']}
                    ]
                },
                { label: 'Pessoa', icon: 'pi pi-fw pi-gift', routerLink: ['/pessoa'] },
                { label: 'Cliente', icon: 'pi pi-fw pi-users', routerLink: ['/cliente'] },
            );
        }

        if (isAdmin) {
            // Apenas ADMIN vê os demais cadastros
            cadastrosItems.push(
                { label: 'Usuário', icon: 'pi pi-fw pi-user', routerLink: ['/usuario'] },
                { label: 'Produto', icon: 'pi pi-fw pi-box', routerLink: ['/produto'] },
                { label: 'Imagem', icon: 'pi pi-fw pi-image', routerLink: ['/imagem'] },
                { label: 'Cor', icon: 'pi pi-fw pi-palette', routerLink: ['/cor'] },
                { label: 'Tamanho', icon: 'pi pi-fw pi-arrows-v', routerLink: ['/tamanho'] },
            );
        }

        const cadastrosSection: MenuItem | null = cadastrosItems.length
            ? { label: 'Cadastros', icon: 'pi pi-fw pi-briefcase', items: cadastrosItems }
            : null;

        // Usuário básico (USUARIO): por enquanto sem página de Perfil implementada, manter apenas Home/Presente
        const sections: MenuItem[] = [homeSection];
        if (cadastrosSection) sections.push(cadastrosSection);

        return sections;
    }
}

