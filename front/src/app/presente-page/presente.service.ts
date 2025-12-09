import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Cliente} from "@/shared/model/cliente";

@Injectable({providedIn: 'root'})
export class PresenteService {
    private http = inject(HttpClient);

    async getResumo(token: string): Promise<any> {
        const base = environment.apiUrl || '';
        const url = `${base}/presente/${encodeURIComponent(token)}`;
        return await firstValueFrom(this.http.get<any>(url));
    }

    async postEscolha(token: string, payload: { produtoId: number; tamanhoId: number; corId: number }): Promise<any> {
        // Deprecated path (mantido por compatibilidade se ainda for utilizado em algum lugar)
        const base = environment.apiUrl || '';
        const url = `${base}/presente/${encodeURIComponent(token)}/escolher`;
        return await firstValueFrom(this.http.post<any>(url, payload));
    }

    async getHistorico(token: string): Promise<{ anteriores: any[] }> {
        const base = environment.apiUrl || '';
        const url = `${base}/presente/${encodeURIComponent(token)}/historico`;
        return await firstValueFrom(this.http.get<{ anteriores: any[] }>(url));
    }

    // Novo endpoint conforme especificação: POST /presente/salvar com um objeto de EventoEscolha
    async salvarEscolha(escolha: any): Promise<any> {
        const base = environment.apiUrl || '';
        const url = `${base}/presente/salvar`;
        return await firstValueFrom(this.http.post<any>(url, escolha));
    }

    limparEscolha(escolha: any): Observable<void> {
        const base = environment.apiUrl || '';
        const url = `${base}/presente/limpar`;
        return this.http.post<void>(url, escolha);
    }

    async validarKey(token: string): Promise<boolean> {
        try {
            await this.getResumo(token);
            return true;
        } catch {
            return false;
        }
    }

}
