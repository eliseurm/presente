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
            { path: 'home', loadComponent: () => import('./app/pages/home/home-component').then(m => m.HomeComponent) }
        ]
    },

    // Alias para o padrão do outro sistema
    { path: 'login-form', redirectTo: '/auth/login', pathMatch: 'full' },

    // Link dinâmico com a chave do presente (público)
    { path: 'presente/:keyMagico', loadComponent: () => import('./app/presente/presente-escolha.component').then(m => m.PresenteEscolhaComponent) },
    { path: 'presente/erro', loadComponent: () => import('./app/presente/presente-erro.component').then(m => m.PresenteErroComponent) },

    // Auth full-screen fora do layout (guard aplica as mesmas regras)
    { path: 'auth', canActivate: [AuthGuardService], loadChildren: () => import('./app/pages/auth/auth.routes') },

    { path: 'notfound', component: Notfound, canActivate: [AuthGuardService] },
    { path: '**', redirectTo: '/notfound' }
];


// import { Routes } from '@angular/router';
// import { AppLayout } from './app/layout/component/app.layout';
// import { Notfound } from './app/pages/notfound/notfound';
//
// export const appRoutes: Routes = [
//     {
//         path: '',
//         component: AppLayout,
//         children: [
//             { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
//             // { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
//         ]
//     },
//     // Link dinâmico com a chave do presente
//     { path: 'presente/:keyMagico', loadComponent: () => import('./app/presente/presente-escolha.component').then(m => m.PresenteEscolhaComponent) },
//     { path: 'presente/erro', loadComponent: () => import('./app/presente/presente-erro.component').then(m => m.PresenteErroComponent) },
//
//     // Auth full-screen fora do layout
//     { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
//
//     { path: 'notfound', component: Notfound },
//     { path: '**', redirectTo: '/notfound' }
// ];
