import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, switchMap, timer} from 'rxjs';
import {environment} from '../../environments/environment';
import {PresenteOrganogramaDto} from "@/shared/model/dto/presente-organograma-dto";

@Injectable({ providedIn: 'root' })
export class PresenteService {

    private http = inject(HttpClient);
    protected apiUrl = '/api/presente';


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

    getOrganograma(): Observable<PresenteOrganogramaDto[]> {
        return this.http.get<PresenteOrganogramaDto[]>(`${this.apiUrl}/organograma`);
    }

    validarDado(campo: string, valor: any): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/validar`, { params: { campo, valor } });
    }

    realizarLogin(dados: any): Observable<any> {
        // O backend espera um objeto com: organoNivel1, organoNivel2, organoNivel3, nome, cpf, nascimento
        return this.http.post<any>(`${this.apiUrl}/login`, dados);
    }

}
