import { Routes } from '@angular/router';

// Rotas de autenticação (login/erro/acesso)
import authRoutes from './pages/auth/auth.routes';

// Rotas auxiliares (notfound redirect)
import pagesRoutes from './pages/pages.routes';

// Guards
import { AuthGuardService as AuthGuard } from './pages/auth/auth-guard-service';
import { RoleGuardService as RoleGuard } from './pages/auth/role-guard.service';

// Páginas (standalone components)
import { HomePageComponent } from './pages/home-page/home-page.component';
import { EventoPageComponent } from './pages/evento-page/evento-page.component';
import { ClientePageComponent } from './pages/cliente-page/cliente-page.component';
import { PessoaPageComponent } from './pages/pessoa-page/pessoa-page.component';
import { UsuarioPageComponent } from './pages/usuario-page/usuario-page.component';
import { ProdutoPageComponent } from './pages/produto-page/produto-page.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Autenticação
  { path: 'auth', children: authRoutes },

  // Públicas
  { path: 'home', component: HomePageComponent },

  // Protegidas por papel
  // ADMIN e CLIENTE podem acessar Evento e Cliente
  { path: 'evento', component: EventoPageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'CLIENTE'] } },
  { path: 'cliente', component: ClientePageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'CLIENTE'] } },

  // Somente ADMIN
  { path: 'pessoa', component: PessoaPageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'usuario', component: UsuarioPageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'produto', component: ProdutoPageComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },

  // Fallbacks adicionais (notfound)
  ...pagesRoutes,
];
