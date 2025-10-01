// TypeScript
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Role = 'ADMINISTRADOR' | 'CLIENTE';

export interface IUser {
    id?: number;
    username?: string;
    email: string;
    role?: Role;
    avatarUrl?: string;
}

const defaultAvatar = 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png';
const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
    readonly defaultPath = '/home';

    private http = inject(HttpClient);
    private router = inject(Router);

    private storageKey = 'auth.user';
    private _user: IUser | null = this.restoreFromStorage();

    get loggedIn(): boolean {
        return !!this._user;
    }

    get user(): IUser | null {
        return this._user;
    }

    get userRole() {
        return this._user?.role;
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

    private persist(user: IUser | null) {
        this._user = user;
        if (user) localStorage.setItem(this.storageKey, JSON.stringify(user));
        else localStorage.removeItem(this.storageKey);
    }


    async logIn(email: string, password: string, remember = false) {
        try {
            if (!email || !password) {
                return { isOk: false, message: 'Credenciais inválidas' };
            }

            const body = { username: email, password };
            const res = await firstValueFrom(
                this.http.post<{
                    token: string;
                    id: number;
                    username: string;
                    role: string;
                    remember: boolean;
                }>(`${API_BASE}/auth/login?remember=${remember}`, body)
            );

            // Armazenar o token JWT baseado no remember
            if (res.remember || remember) {
                localStorage.setItem('auth.token', res.token);
                sessionStorage.removeItem('auth.token'); // Garante que não fica duplicado
            } else {
                sessionStorage.setItem('auth.token', res.token);
                localStorage.removeItem('auth.token'); // Garante que não fica duplicado
            }

            const user: IUser = {
                id: res.id,
                username: res.username,
                email: res.username,
                role: res.role as Role,
                avatarUrl: defaultAvatar
            };

            this.persist(user);

            // Redireciona para a URL salva ou para a rota padrão
            const redirectUrl = this.getRedirectUrl();
            await this.router.navigate([redirectUrl]);

            return { isOk: true, data: user };
        } catch (e: any) {
            const msg = e?.error?.message || 'Falha de autenticação';
            return { isOk: false, message: msg };
        }
    }

    async getUser() {
        try {
            if (this._user) {
                return { isOk: true, data: this._user };
            }

            const res = await firstValueFrom(
                this.http.get<{ id: number; username: string; role: Role }>(`${API_BASE}/auth/me`)
            );

            const user: IUser = {
                id: res.id,
                username: res.username,
                email: res.username,
                role: res.role as Role,
                avatarUrl: defaultAvatar
            };

            this.persist(user);
            return { isOk: true, data: user };
        } catch {
            this.persist(null);
            return { isOk: false, data: null };
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
            this.persist(null);
            await this.router.navigate(['/auth/login']);
        }
    }

    private clearClientAuthArtifacts() {
        try {
            // limpa possíveis dados locais da sessão
            sessionStorage.clear();
        } catch {}
        try {
            // remove qualquer token ou cache relacionado (best-effort)
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem('auth.token');
        } catch {}
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
                        { currentPassword, newPassword },
                        { withCredentials: true }
                    )
                );
                return { isOk: true };
            } catch (e: any) {
                const msg = e?.error?.message || 'Não foi possível alterar a senha.';
                return { isOk: false, message: msg };
            }
        }


}
