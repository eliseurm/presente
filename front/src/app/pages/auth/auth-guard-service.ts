// TypeScript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth-service';
import {PapelEnum} from "@/shared/model/enum/papel.enum";

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private auth: AuthService) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const url = state.url || '/';
        const isAuthForm = this.isAuthUrl(url);
        const isPublic = this.isPublicUrl(url);

        // Se ainda não logado, tenta hidratar a partir do cookie via /auth/me
        if (!this.auth.loggedIn && !isAuthForm && !isPublic) {
            await this.auth.getUser();
        }

        const isLoggedIn = this.auth.loggedIn;

        // Logado tentando acessar telas de autenticação -> manda para defaultPath (/home)
        if (isLoggedIn && isAuthForm) {
            this.auth.lastAuthenticatedPath = this.auth.defaultPath;
            this.router.navigate([this.auth.defaultPath]);
            return false;
        }

        // Não logado tentando rota protegida -> manda para login
        if (!isLoggedIn && !isAuthForm && !isPublic) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        // Verificação opcional de papel por rota (use data: { roles: ['ADMINISTRADOR'] })
        const requiredRoles = (route.data?.['roles'] as PapelEnum[] | undefined) || undefined;
        if (isLoggedIn && requiredRoles?.length) {
            const userRole = this.auth.userRole;
            const allowed = userRole && requiredRoles.includes(userRole);
            if (!allowed) {
                this.router.navigate(['/auth/access']);
                return false;
            }
        }

        // Logado navegando em rota protegida -> atualiza última rota autenticada
        if (isLoggedIn && !isAuthForm) {
            this.auth.lastAuthenticatedPath = url;
        }

        return isLoggedIn || isAuthForm || isPublic;
    }

    private isAuthUrl(url: string): boolean {
        return (
            url === '/login-form' ||
            url.startsWith('/auth/login') ||
            url.startsWith('/auth/reset-password') ||
            url.startsWith('/auth/create-account') ||
            url.startsWith('/auth/change-password')
        );
    }

    private isPublicUrl(url: string): boolean {
        return url.startsWith('/presente') || url.startsWith('/notfound');
    }
}
