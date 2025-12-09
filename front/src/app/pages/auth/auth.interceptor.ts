
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

    // Não enviar Authorization para endpoints públicos de presente
    const isPresentePublic = req.url.includes('/presente/');
    // Não enviar Authorization para imagens públicas: GET /imagem/{id}/arquivo (também funciona com prefixo /api)
    const isPublicImage = req.method === 'GET' && req.url.includes('/imagem/') && req.url.endsWith('/arquivo');

    const authReq = token && !(isPresentePublic || isPublicImage)
        ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
        : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Evita intervir em chamadas de assets e na própria tela de login
            const isAuthRoute = router.url?.startsWith('/auth');
            const isAssets = (error.url || '').includes('/assets/');

            // Não redirecionar para login se o 401 vier de rotas públicas
            const isPublic401 = error.status === 401 && (
                (error.url || '').includes('/presente/') ||
                (((error.url || '').includes('/imagem/')) && ((error.url || '').endsWith('/arquivo')))
            );

            // Em 401: sessão inválida/expirada → limpar credenciais e redirecionar para login
            if (error.status === 401 && !isAuthRoute && !isAssets && !isPublic401) {
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
