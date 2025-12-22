import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, switchMap, timer} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PresenteService {
    private http = inject(HttpClient);

    private getBase(): string {
        return environment.apiUrl || '';
    }

    getResumo(token: string): Observable<any> {
        const url = `${this.getBase()}/presente/${encodeURIComponent(token)}`;
        return this.http.get<any>(url);
    }

    postEscolha(token: string, payload: { produtoId: number; tamanhoId: number; corId: number }): Observable<any> {
        const url = `${this.getBase()}/presente/${encodeURIComponent(token)}/escolher`;
        return this.http.post<any>(url, payload);
    }

    getHistorico(token: string): Observable<{ anteriores: any[] }> {
        const url = `${this.getBase()}/presente/${encodeURIComponent(token)}/historico`;
        return this.http.get<{ anteriores: any[] }>(url);
    }

    // salvarEscolha(escolha: any): Observable<any> {
    //     const url = `${this.getBase()}/presente/salvar`;
    //     return this.http.post<any>(url, escolha);
    // }

    salvarEscolha(escolha: any): Observable<any> {
        const url = `${this.getBase()}/presente/salvar`;
        // Adiciona 100ms de espera antes de disparar
        return timer(100).pipe(
            switchMap(() => this.http.post<any>(url, escolha))
        );
    }

    limparEscolha(escolha: any): Observable<void> {
        const url = `${this.getBase()}/presente/limpar`;
        return this.http.post<void>(url, escolha);
    }

    // Nota: Para validarKey como Observable, retornaria Observable<boolean>
    validarKey(token: string): Observable<any> {
        return this.getResumo(token);
    }
}
