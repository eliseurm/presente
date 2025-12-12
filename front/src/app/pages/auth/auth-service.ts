// TypeScript
import {Injectable, inject} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {PapelEnum} from "@/shared/model/enum/papel.enum";

// export type Role = 'ADMIN' | 'ADMINISTRADOR' | 'CLIENTE' | 'USUARIO';

export interface IUser {
    id?: number;
    username?: string;
    email: string;
    papel?: PapelEnum;
    status?: StatusEnum
    cliente_ids?: number[];
    avatarUrl?: string;
}

const defaultAvatar = 'images/avatar.png';
const API_BASE = '/api';

@Injectable({providedIn: 'root'})
export class AuthService {

    readonly defaultPath = '/home';

    private http = inject(HttpClient);
    private router = inject(Router);

    private storageKey = 'auth.user';
    private _user: IUser | null = this.restoreFromStorage();
    papelEnumType: any = PapelEnum;


    get loggedIn(): boolean {
        return !!this._user;
    }

    get user(): IUser | null {
        return this._user;
    }

    get userRole() {
        return this._user?.papel;
    }

    // Helpers de papel
    isAdmin(): boolean {
        return this.userRole === this.papelEnumType.ADMIN.key;
    }

    isCliente(): boolean {
        return this.userRole === this.papelEnumType.CLIENTE.key;
    }

    isUsuario(): boolean {
        return this.userRole === this.papelEnumType.USUARIO.key;
    }

    isClienteAtivo(): boolean {
        if (!this.isCliente()) return false;

        const u: IUser = this._user as IUser;
        return u.status === StatusEnum.ATIVO;
    }

    getClienteIds(): number[] {
        return (this._user?.cliente_ids ?? []) as number[];
    }

    private _lastAuthenticatedPath = this.defaultPath;
    set lastAuthenticatedPath(value: string) {
        this._lastAuthenticatedPath = value || this.defaultPath;
    }

    /**
     * Obtém a URL salva para redirecionamento após login
     */
    private getRedirectUrl(): string {
        const savedUrl = sessionStorage.getItem('auth.redirectUrl');
        if (savedUrl) {
            sessionStorage.removeItem('auth.redirectUrl');
            return savedUrl;
        }
        return this._lastAuthenticatedPath;
    }

    /**
     * Limpa o usuário da memória (usado pelo interceptor)
     */
    clearUser() {
        this._user = null;
    }

    private restoreFromStorage(): IUser | null {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? (JSON.parse(raw) as IUser) : null;
        } catch {
            return null;
        }
    }

    private persistStorage(user: IUser | null) {
        this._user = user;
        if (user) localStorage.setItem(this.storageKey, JSON.stringify(user));
        else localStorage.removeItem(this.storageKey);
    }

    // Gerência de token
    getToken(): string | null {
        return localStorage.getItem('auth.token') || sessionStorage.getItem('auth.token');
    }

    setToken(token: string, remember = false) {
        if (remember) {
            localStorage.setItem('auth.token', token);
            sessionStorage.removeItem('auth.token');
        }
        else {
            sessionStorage.setItem('auth.token', token);
            localStorage.removeItem('auth.token');
        }
    }

    clearToken() {
        localStorage.removeItem('auth.token');
        sessionStorage.removeItem('auth.token');
    }

    /**
     * Decodifica o payload do JWT sem validar assinatura (uso de UI).
     */
    decodeToken<T = any>(token?: string | null): T | null {
        try {
            const t = token ?? this.getToken();
            if (!t) return null;
            const parts = t.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(payload);
            return JSON.parse(json) as T;
        } catch {
            return null;
        }
    }

    /**
     * Restaura usuário a partir do storage e do token (claims) ao iniciar o app.
     */
    restoreStorage(): void {
        // Se já houver usuário em memória, não faz nada
        if (this._user) return;
        // Tenta restaurar do storage
        const stored = this.restoreFromStorage();
        if (stored) {
            this._user = stored;
            return;
        }
        // Sem user armazenado: tenta decodificar do token para preencher informações mínimas
        const claims = this.decodeToken<any>();
        if (claims) {
            // role vem em authorities (scope) no claim "scope" (string com espaços)
            const scope: string = (claims['scope'] || '') as string;
            const firstRole = (scope.split(' ').find(r => r.startsWith('ROLE_')) || '').replace('ROLE_', '');
            const papelEnumValue = Object.values(PapelEnum).find(p => p.key === firstRole);
            const clienteIds: number[] = (claims['cliente_ids'] || []) as number[];
            const username = (claims['sub'] || '') as string;
            const user: IUser = {
                username,
                email: username,
                papel: (papelEnumValue as PapelEnum) || undefined,
                cliente_ids: clienteIds,
                avatarUrl: defaultAvatar
            };
            this.persistStorage(user);
        }
    }


    async logIn(email: string, password: string, remember = false) {
        try {
            if (!email || !password) {
                return {isOk: false, message: 'Credenciais inválidas'};
            }

            const body = {username: email, password};
            const res = await firstValueFrom(
                this.http.post<{
                    token: string;
                    id: number;
                    username: string;
                    papel: PapelEnum;
                    status: StatusEnum;
                    remember: boolean;
                }>(`${API_BASE}/auth/login?remember=${remember}`, body)
            );

            // Armazenar o token JWT baseado no remember
            this.setToken(res.token, (res.remember || remember));

            const user: IUser = {
                id: res.id,
                username: res.username,
                email: res.username,
                papel: res.papel || undefined,
                status: res.status,
                avatarUrl: defaultAvatar
            };

            // Se claims estiverem presentes no token, complementa dados
            const claims = this.decodeToken<any>(res.token);
            if (claims && Array.isArray(claims['cliente_ids'])) {
                user.cliente_ids = claims['cliente_ids'];
            }

            this.persistStorage(user);

            // Redireciona para a URL salva ou rota padrão por papel
            const saved = this.getRedirectUrl();
            const fallback = ((): string => {
                if (user.papel === this.papelEnumType.ADMIN.key) return '/home';
                if (user.papel === this.papelEnumType.CLIENTE.key) return '/evento';
                // USUARIO e demais
                return '/home';
            })();
            await this.router.navigate([saved || fallback]);

            return {isOk: true, data: user};
        } catch (e: any) {
            const msg = e?.error?.message || 'Falha de autenticação';
            return {isOk: false, message: msg};
        }
    }

    async getUser() {
        try {
            if (this._user) {
                return {isOk: true, data: this._user};
            }

            const res = await firstValueFrom(
                this.http.get<{ id: number; username: string; papel: PapelEnum, status: StatusEnum }>(`${API_BASE}/auth/me`)
            );

            const user: IUser = {
                id: res.id,
                username: res.username,
                email: res.username,
                papel: res.papel as PapelEnum,
                status: res.status as StatusEnum,
                avatarUrl: defaultAvatar
            };

            this.persistStorage(user);
            return {isOk: true, data: user};
        } catch {
            this.persistStorage(null);
            return {isOk: false, data: null};
        }
    }

    async logOut() {
        try {
            await firstValueFrom(
                this.http.post(`${API_BASE}/auth/logout`, {})
            );
        } catch {
            // ignora erro de rede/logout
        } finally {
            this.clearClientAuthArtifacts();
            this.persistStorage(null);
            await this.router.navigate(['/auth/login']);
        }
    }

    private clearClientAuthArtifacts() {
        try {
            // limpa possíveis dados locais da sessão
            sessionStorage.clear();
        } catch {
        }
        try {
            // remove qualquer token ou cache relacionado (best-effort)
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('auth.token');
        } catch {
        }
        try {
            // tentativa best-effort de expirar cookie não httpOnly com o mesmo nome (se existir)
            const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
            const paths = ['/', ''];
            for (const p of paths) {
                document.cookie = `AUTH=; Expires=${expire}; Max-Age=0; Path=${p}; SameSite=Lax`;
                const host = location.hostname;
                const parts = host.split('.');
                if (parts.length > 1) {
                    const base = '.' + parts.slice(-2).join('.');
                    document.cookie = `AUTH=; Expires=${expire}; Max-Age=0; Path=${p}; Domain=${base}; SameSite=Lax`;
                }
            }
        } catch {
            // ambiente sem acesso a document (SSR), ignore
        }
    }

    async changePassword(currentPassword: string, newPassword: string) {
        try {
            await firstValueFrom(
                this.http.put(
                    `${API_BASE}/users/me/password`,
                    {currentPassword, newPassword},
                    {withCredentials: true}
                )
            );
            return {isOk: true};
        } catch (e: any) {
            const msg = e?.error?.message || 'Não foi possível alterar a senha.';
            return {isOk: false, message: msg};
        }
    }


}
