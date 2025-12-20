// src/app/services/pessoa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { PessoaFilter } from '../shared/model/filter/pessoa-filter';
import {map, Observable} from 'rxjs';
import {Pessoa} from "@/shared/model/pessoa";
import { HttpParams } from '@angular/common/http';
import {PessoaDto} from "@/shared/model/dto/pessoa-dto";
import {PessoaMapper} from "@/shared/model/mapper/pessoa-mapper";

@Injectable({
    providedIn: 'root'
})
export class PessoaService extends BaseCrudService<Pessoa, PessoaFilter> {
    protected apiUrl = '/api/pessoa';

    constructor(http: HttpClient) {
        super(http);
    }

    // Métodos específicos de Pessoa podem ser adicionados aqui
    buscarPorStatus(status: string): Observable<Pessoa[]> {
        return this.http.get<Pessoa[]>(`${this.apiUrl}/status/${status}`);
    }

    // pesquisa leve de pessoas (ADMIN global; CLIENTE restrito ao(s) seus clientes)
    findPessoaPorCliente(clienteId: number, query?: string): Observable<Pessoa[]> {

        let params = new HttpParams();
        if (query && query.trim().length > 0) params = params.set('query', query.trim());
        if (clienteId != null) params = params.set('clienteId', String(clienteId));

        return this.http.get<PessoaDto[]>(`${this.apiUrl}/pesquisa`, { params })
            .pipe(
                map((dtos: PessoaDto[]) => PessoaMapper.listFromDto(dtos))
            );

    }
}
