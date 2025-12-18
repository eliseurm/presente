import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseCrudService} from '@/shared/services/base-crud.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {map, Observable} from 'rxjs';
import {EventoEscolhaDTO} from "@/shared/model/dto/evento-escolha-dto";
import {EventoDTO} from "@/shared/model/dto/evento-dto";
import {EventoPessoaDTO} from "@/shared/model/dto/evento-pessoa-dto";
import {PessoaDTO} from "@/shared/model/dto/pessoa-dto";
import {PessoaMapper} from "@/shared/model/mapper/pessoa-mapper";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {EventoPessoaMapper} from "@/shared/model/mapper/evento-pessoa-mapper";
import {EventoProduto} from "@/shared/model/evento-produto";
import {EventoProdutoDTO} from "@/shared/model/dto/evento-produto-dto";
import {EventoProdutoMapper} from "@/shared/model/mapper/evento-produto-mapper";

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

    getEventoPessoa(eventoId: number): Observable<EventoPessoa[]> {
        return this.http.get<EventoPessoaDTO[]>(`${this.apiUrl}/${eventoId}/pessoas/list`)
            .pipe(
                map((dtos: EventoPessoaDTO[]) => EventoPessoaMapper.listFromDto(dtos))
            );
    }

    getEventoProduto(eventoId: number): Observable<EventoProduto[]> {
        return this.http.get<EventoProdutoDTO[]>(`${this.apiUrl}/${eventoId}/produtos/list`)
            .pipe(
                map((dtos: EventoProdutoDTO[]) => EventoProdutoMapper.listFromDto(dtos))
            );
    }

}
