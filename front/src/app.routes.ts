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
            { path: 'home', loadComponent: () => import('@/pages/home-page/home-page.component').then(m => m.HomePageComponent) },
            { path: 'pessoa', loadComponent: () => import('@/pages/pessoa-page/pessoa-page.component').then(m => m.PessoaPageComponent) },
            { path: 'usuario/perfil', loadComponent: () => import('@/pages/usuario-perfil-page/usuario-perfil-page.component').then(m => m.UsuarioPerfilPageComponent) },
            { path: 'cor', loadComponent: () => import('@/pages/cor-page/cor-page.component').then(m => m.CorPageComponent) },
        ]
    },

    { path: 'teste', loadComponent: () => import('@/pages/teste-page/teste-page.component').then(m => m.TestePageComponent) },

    { path: 'login-form', redirectTo: '/auth/login', pathMatch: 'full' },

    { path: 'presente/:keyMagico', loadComponent: () => import('@/presente-page/presente-escolha.component').then(m => m.PresenteEscolhaComponent) },
    { path: 'presente/erro', loadComponent: () => import('@/presente-page/presente-erro.component').then(m => m.PresenteErroComponent) },

    { path: 'auth', canActivate: [AuthGuardService], loadChildren: () => import('./app/pages/auth/auth.routes') },

    { path: 'notfound', component: Notfound, canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/notfound' }
];
