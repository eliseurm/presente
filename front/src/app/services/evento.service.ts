import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {BaseCrudService} from '@/shared/services/base-crud.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {map, Observable, throwError} from 'rxjs';
import {EventoEscolhaDto} from "@/shared/model/dto/evento-escolha-dto";
import {EventoDto} from "@/shared/model/dto/evento-dto";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {EventoPessoaMapper} from "@/shared/model/mapper/evento-pessoa-mapper";
import {EventoProduto} from "@/shared/model/evento-produto";
import {EventoProdutoDto} from "@/shared/model/dto/evento-produto-dto";
import {EventoProdutoMapper} from "@/shared/model/mapper/evento-produto-mapper";
import {EventoMapper} from "@/shared/model/mapper/evento-mapper";
import {filter} from "rxjs/operators";
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';
import {EventoPessoaFilter} from "@/shared/model/filter/evento-pessoa-filter";
import {PageResponse} from "@/shared/model/page-response";
import {EventoReportFilter} from "@/shared/model/filter/evento-report-filter";
import {ProgressoTarefaDto} from "@/shared/model/dto/processo-tarefe-dto";
import {Pessoa} from "@/shared/model/pessoa";
import {StatusEnum} from "@/shared/model/enum/status.enum";

@Injectable({ providedIn: 'root' })
export class EventoService extends BaseCrudService<Evento, EventoFilter> {
    protected apiUrl = '/api/evento';

    constructor(http: HttpClient) {
        super(http);
    }

    updateEventoPessoa(eventoId: number, eventoPessoa: EventoPessoa): Observable<EventoPessoa> {
        const eventoPessoaDto: EventoPessoaDto = EventoPessoaMapper.toDTO(eventoPessoa);

        return this.http.post<EventoPessoa>(`${this.apiUrl}/${eventoId}/eventoPessoa`, eventoPessoaDto);
    }

    addOrUpdateProduto(eventoId: number, produtoId: number, status: string): Observable<EventoProduto> {
        // O Controller espera um objeto JSON { produtoId: ..., status: ... }
        return this.http.post<EventoProduto>(`${this.apiUrl}/${eventoId}/produtos`, {
            produtoId: produtoId,
            status: status
        });
    }

    removerProdutoVinculo(eventoId: number, eventoProdutoId: number): Observable<void> {
        // O Controller espera DELETE /evento/{id}/produtos/{eventoProdutoId}
        return this.http.delete<void>(`${this.apiUrl}/${eventoId}/produtos/${eventoProdutoId}`);
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

    eventoPessoaDeleteLote(eventoId: number | undefined, eventoPessoaIdList: number[]): Observable<{ total: number; deletados: number }> {
        if(!eventoId){
            return throwError(() => new Error('O ID do evento é obrigatório.'));
        }
        return this.http.delete<{ total: number; deletados: number }>(`${this.apiUrl}/${eventoId}/eventoPessoaDeleteLota`, {body: eventoPessoaIdList});
    }

    getEventoProduto(eventoId: number): Observable<EventoProduto[]> {
        return this.http.get<EventoProdutoDto[]>(`${this.apiUrl}/${eventoId}/produtos/list`)
            .pipe(map((dtos: EventoProdutoDto[]) => EventoProdutoMapper.listFromDto(dtos)));
    }

    listEventoPessoaPaginado(filter: EventoPessoaFilter): Observable<PageResponse<EventoPessoa>> {
        if(!filter.eventoId){
            return throwError(() => new Error('O ID do evento é obrigatório para realizar a busca.'));
        }
        return this.http.post<PageResponse<EventoPessoaDto>>(`${this.apiUrl}/${filter.eventoId}/eventoPessoaList`, filter)
            .pipe(
                map((page: PageResponse<EventoPessoaDto>) => {
                    const contentMapped: EventoPessoa[] = EventoPessoaMapper.listFromDto(page.content);
                    return {
                        ...page,
                        content: contentMapped
                    };
                })
            );
    }

    gerarRelatorioPdf(filter: EventoReportFilter): Observable<Blob> {
        // É crucial definir 'responseType' como 'blob' para o Angular não tentar ler como JSON
        return this.http.post(`${this.apiUrl}/relatorio/pdf`, filter, {
            responseType: 'blob'
        });
    }

    iniciaImportacaoArquivoCsv(eventoId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/${eventoId}/importar-csv`, formData);
    }

    iniciaEnvioEmails(eventoId: number | undefined): Observable<void> {
        if(!eventoId){
            return throwError(() => new Error('O ID do evento é obrigatório para realizar a busca.'));
        }
        return this.http.post<void>(`${this.apiUrl}/${eventoId}/enviar-emails`, {});
    }

    getStatusProgresso(eventoId: number | undefined): Observable<ProgressoTarefaDto> {
        if(!eventoId){
            return throwError(() => new Error('O ID do evento é obrigatório para realizar a busca.'));
        }
        return this.http.get<ProgressoTarefaDto>(`${this.apiUrl}/${eventoId}/status-processo`);
    }

    pararProgresso(eventoId: number | undefined): Observable<ProgressoTarefaDto> {
        if(!eventoId){
            return throwError(() => new Error('O ID do evento é obrigatório para realizar a busca.'));
        }
        return this.http.get<ProgressoTarefaDto>(`${this.apiUrl}/${eventoId}/parar-processo`);
    }



}
