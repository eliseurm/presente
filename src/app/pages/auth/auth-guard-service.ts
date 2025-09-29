// TypeScript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private auth: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url = state.url || '/';
        const isLoggedIn = this.auth.loggedIn;
        const isAuthForm = this.isAuthUrl(url);
        const isPublic = this.isPublicUrl(url);

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

// // TypeScript
// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '@/pages/auth/auth-service';
//
// @Injectable({ providedIn: 'root' })
// export class AuthGuardService implements CanActivate {
//     constructor(private router: Router, private auth: AuthService) {}
//
//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//         const url = state.url || '/';
//         const isLoggedIn = this.auth.loggedIn;
//         const isAuthForm = this.isAuthUrl(url);
//         const isPublic = this.isPublicUrl(url);
//
//         // Se logado tentando acessar telas de autenticação -> envia ao defaultPath
//         if (isLoggedIn && isAuthForm) {
//             this.auth.lastAuthenticatedPath = this.auth.defaultPath;
//             this.router.navigate([this.auth.defaultPath]);
//             return false;
//         }
//
//         // Se não logado e tentando rota protegida -> envia ao login
//         if (!isLoggedIn && !isAuthForm && !isPublic) {
//             this.router.navigate(['/auth/login']);
//             return false;
//         }
//
//         // Se logado e não é tela de autenticação -> atualiza última rota autenticada
//         if (isLoggedIn && !isAuthForm) {
//             this.auth.lastAuthenticatedPath = url;
//         }
//
//         return isLoggedIn || isAuthForm || isPublic;
//     }
//
//     private isAuthUrl(url: string): boolean {
//         return (
//             url === '/login-form' ||
//             url.startsWith('/auth/login') ||
//             url.startsWith('/auth/reset-password') ||
//             url.startsWith('/auth/create-account') ||
//             url.startsWith('/auth/change-password')
//         );
//     }
//
//     private isPublicUrl(url: string): boolean {
//         return (
//             url.startsWith('/presente') ||
//             url.startsWith('/notfound')
//         );
//     }
// }
