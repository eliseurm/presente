import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {BaseCrudService} from '@/shared/services/base-crud.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {map, Observable} from 'rxjs';
import {EventoEscolhaDto} from "@/shared/model/dto/evento-escolha-dto";
import {EventoDto} from "@/shared/model/dto/evento-dto";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {PessoaDto} from "@/shared/model/dto/pessoa-dto";
import {PessoaMapper} from "@/shared/model/mapper/pessoa-mapper";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {EventoPessoaMapper} from "@/shared/model/mapper/evento-pessoa-mapper";
import {EventoProduto} from "@/shared/model/evento-produto";
import {EventoProdutoDto} from "@/shared/model/dto/evento-produto-dto";
import {EventoProdutoMapper} from "@/shared/model/mapper/evento-produto-mapper";
import {EventoMapper} from "@/shared/model/mapper/evento-mapper";
import {filter} from "rxjs/operators";
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';

@Injectable({ providedIn: 'root' })
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

    pausarEvento(eventoId: number): Observable<{ pausados: number }> {
        return this.http.post<{ pausados: number }>(`${this.apiUrl}/${eventoId}/pausar`, {});
    }

    pararEvento(eventoId: number): Observable<Evento> {
        return this.http.post<EventoDto>(`${this.apiUrl}/${eventoId}/parar`, {}).pipe(
            map((dto: EventoDto) => EventoMapper.fromDto(dto)),
            filter((evento): evento is Evento => !!evento)
        );
    }

    getUltimaEscolha(eventoId: number, pessoaId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${eventoId}/pessoas/${pessoaId}/escolha/ultima`);
    }

    getHistoricoEscolhas(eventoId: number, pessoaId: number): Observable<EventoEscolhaDto[]> {
        return this.http.get<EventoEscolhaDto[]>(`${this.apiUrl}/${eventoId}/pessoas/${pessoaId}/escolha/historico`);
    }

    getEventoPessoa(eventoId: number): Observable<EventoPessoa[]> {
        return this.http.get<EventoPessoaDto[]>(`${this.apiUrl}/${eventoId}/pessoas/list`).pipe(map((dtos: EventoPessoaDto[]) => EventoPessoaMapper.listFromDto(dtos)));
    }

    getEventoProduto(eventoId: number): Observable<EventoProduto[]> {
        return this.http.get<EventoProdutoDto[]>(`${this.apiUrl}/${eventoId}/produtos/list`).pipe(map((dtos: EventoProdutoDto[]) => EventoProdutoMapper.listFromDto(dtos)));
    }

    importarPessoasCsv(eventoId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        // O endpoint conforme EventoController: POST /evento/{id}/pessoas/import
        return this.http.post(`${this.apiUrl}/${eventoId}/pessoas/import`, formData);
    }

    listarPessoasPaginado(eventoId: number, filtro: PessoaFilter): Observable<any> {
        let params = new HttpParams();

        // Mapeia propriedades do filtro
        if (filtro.nome) params = params.set('nome', filtro.nome);
        if (filtro.cpf) params = params.set('cpf', filtro.cpf);
        if (filtro.email) params = params.set('email', filtro.email);

        // Mapeia paginação (assumindo que PessoaFilter estende BaseFilter com page/size)
        // Se PessoaFilter não tiver page/size, use filtro['page'] ou passe argumentos separados
        if (filtro.page !== undefined) params = params.set('page', filtro.page.toString());
        if (filtro.size !== undefined) params = params.set('size', filtro.size.toString());

        return this.http.get<any>(`${this.apiUrl}/${eventoId}/pessoas`, { params });
    }

}
