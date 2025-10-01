
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('auth.token') || sessionStorage.getItem('auth.token');

    if (token) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });

        return next(cloned).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Token expirado ou inválido
                    // Salva a rota atual antes de redirecionar
                    const currentPath = window.location.pathname;
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

                    // Redireciona para o login
                    router.navigate(['/auth/login']);
                }
                return throwError(() => error);
            })
        );
    }

    return next(req);
};
