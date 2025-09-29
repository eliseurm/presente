// TypeScript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface IUser {
    email: string;
    avatarUrl?: string;
}

const defaultUser: IUser = {
    email: 'user@example.com',
    avatarUrl: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    // Destino padrão após login (ajuste se desejar outra rota)
    readonly defaultPath = '/home';

    private _user: IUser | null = null;

    get loggedIn(): boolean {
        return !!this._user;
    }

    private _lastAuthenticatedPath = this.defaultPath;
    set lastAuthenticatedPath(value: string) {
        this._lastAuthenticatedPath = value || this.defaultPath;
    }

    constructor(private router: Router) {}

    async logIn(email: string, password: string) {
        try {
            // Simulação de autenticação. Substitua por chamada HTTP quando tiver backend.
            if (!email || !password) {
                return { isOk: false, message: 'Credenciais inválidas' };
            }

            this._user = { ...defaultUser, email };
            await this.router.navigate([this._lastAuthenticatedPath]);

            return {
                isOk: true,
                data: this._user
            };
        } catch {
            return {
                isOk: false,
                message: 'Falha de autenticação'
            };
        }
    }

    async getUser() {
        try {
            return {
                isOk: true,
                data: this._user
            };
        } catch {
            return {
                isOk: false,
                data: null
            };
        }
    }

    async logOut() {
        this._user = null;
        await this.router.navigate(['/login-form']);
    }
}
