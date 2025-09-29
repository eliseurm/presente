// TypeScript
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuardService } from '@/pages/auth/auth-guard-service';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuardService],
        children: [
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: 'home', loadComponent: () => import('./app/pages/home/home-component').then(m => m.HomeComponent) },
            // Perfil do Usuário (protegido)
            { path: 'usuario/perfil', loadComponent: () => import('./app/pages/usuario-perfil-component/usuario-perfil-component').then(m => m.UsuarioPerfilComponent) }
        ]
    },

    { path: 'login-form', redirectTo: '/auth/login', pathMatch: 'full' },

    { path: 'presente/:keyMagico', loadComponent: () => import('./app/presente/presente-escolha.component').then(m => m.PresenteEscolhaComponent) },
    { path: 'presente/erro', loadComponent: () => import('./app/presente/presente-erro.component').then(m => m.PresenteErroComponent) },

    { path: 'auth', canActivate: [AuthGuardService], loadChildren: () => import('./app/pages/auth/auth.routes') },

    { path: 'notfound', component: Notfound, canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/notfound' }
];
