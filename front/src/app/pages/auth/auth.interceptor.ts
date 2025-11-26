
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';

// Evita múltiplos redirecionamentos simultâneos
let isRedirectingToLogin = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('auth.token') || sessionStorage.getItem('auth.token');

    const authReq = token
        ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Evita intervir em chamadas de assets e na própria tela de login
            const isAuthRoute = router.url?.startsWith('/auth');
            const isAssets = (error.url || '').includes('/assets/');

            // Em 401: sessão inválida/expirada → limpar credenciais e redirecionar para login
            if (error.status === 401 && !isAuthRoute && !isAssets) {
                if (!isRedirectingToLogin) {
                    isRedirectingToLogin = true;

                    // Salva a rota atual antes de redirecionar (se não estiver em /auth)
                    const currentPath = window.location.pathname + window.location.search;
                    if (currentPath !== '/auth/login' && !currentPath.startsWith('/auth')) {
                        sessionStorage.setItem('auth.redirectUrl', currentPath);
                    }

                    // Limpa o token e dados do usuário
                    localStorage.removeItem('auth.token');
                    localStorage.removeItem('auth.user');
                    sessionStorage.removeItem('auth.token');
                    sessionStorage.removeItem('auth.user');

                    // Marca que o usuário foi deslogado por expiração
                    authService.clearUser();

                    // Redireciona para o login e reseta a flag após navegação
                    router.navigate(['/auth/login']).finally(() => {
                        setTimeout(() => (isRedirectingToLogin = false), 300);
                    });
                }
            }

            // Em 403: acesso negado → não limpar token nem redirecionar automaticamente
            // Deixa o componente/tela tratar a mensagem conforme necessário

            return throwError(() => error);
        })
    );
};
