import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseCrudService} from '@/shared/services/base-crud.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {Observable} from 'rxjs';
import {EventoEscolhaDTO} from "@/shared/model/dto/evento-escolha-dto";
import {EventoDTO} from "@/shared/model/dto/evento-dto";

@Injectable({providedIn: 'root'})
export class EventoService extends BaseCrudService<Evento, EventoFilter> {

    protected apiUrl = '/api/evento';

    constructor(http: HttpClient) {
        super(http);
    }

    importPessoasCsv(eventoId: number, file: File): Observable<{ adicionados: number }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ adicionados: number }>(`${this.apiUrl}/${eventoId}/pessoas/import`, formData);
    }

    iniciarEvento(eventoId: number, baseUrl?: string): Observable<{ gerados: number; links: string[] }> {
        const body = baseUrl ? { baseUrl } : {};
        return this.http.post<{ gerados: number; links: string[] }>(`${this.apiUrl}/${eventoId}/iniciar`, body);
    }

    pararEvento(eventoId: number): Observable<{ pausados: number }> {
        return this.http.post<{ pausados: number }>(`${this.apiUrl}/${eventoId}/parar`, {});
    }

    getUltimaEscolha(eventoId: number, pessoaId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${eventoId}/pessoas/${pessoaId}/escolha/ultima`);
    }

    getHistoricoEscolhas(eventoId: number, pessoaId: number): Observable<EventoEscolhaDTO[]> {
        return this.http.get<EventoEscolhaDTO[]>(`${this.apiUrl}/${eventoId}/pessoas/${pessoaId}/escolha/historico`);
    }
}
