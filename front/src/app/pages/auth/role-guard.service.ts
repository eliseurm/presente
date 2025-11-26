// TypeScript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService, Role } from './auth-service';

@Injectable({ providedIn: 'root' })
export class RoleGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Se não estiver autenticado, deixa o AuthGuard tratar. Aqui só valida papel.
    const requiredRoles = (route.data?.['roles'] as Role[] | undefined) || undefined;
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const role = (this.auth.userRole || '').toUpperCase();
    const normalizedRole: Role | '' = (role === 'ADMINISTRADOR' ? 'ADMIN' : (role as Role)) as Role;

    const allowed = normalizedRole && requiredRoles.map(r => (r === 'ADMINISTRADOR' ? 'ADMIN' : r)).includes(normalizedRole);
    if (!allowed) {
      // Sem permissão → direciona para página de acesso negado (ou home)
      this.router.navigate(['/auth/access']);
      return false;
    }

    // Regras opcionais: validar clientId presente na rota quando exigido
    const needsClientScope = !!route.data?.['requireClientScope'];
    if (needsClientScope) {
      const idParam = route.paramMap.get('clienteId') || route.queryParamMap.get('clienteId');
      if (idParam) {
        const cid = Number(idParam);
        if (!Number.isNaN(cid)) {
          const allowedIds = this.auth.getClienteIds() || [];
          if (allowedIds.length > 0 && !allowedIds.includes(cid)) {
            this.router.navigate(['/auth/access']);
            return false;
          }
        }
      }
    }

    return true;
  }
}
