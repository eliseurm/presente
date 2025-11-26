// src/app/services/pessoa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { PessoaFilter } from '../shared/model/filter/pessoa-filter';
import { Observable } from 'rxjs';
import {Pessoa} from "@/shared/model/pessoa";
import { HttpParams } from '@angular/common/http';

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

    // Lookup leve de pessoas (ADMIN global; CLIENTE restrito ao(s) seus clientes)
    lookup(q?: string, clienteId?: number): Observable<Pessoa[]> {
        let params = new HttpParams();
        if (q && q.trim().length > 0) params = params.set('q', q.trim());
        if (clienteId != null) params = params.set('clienteId', String(clienteId));
        return this.http.get<Pessoa[]>(`${this.apiUrl}/lookup`, { params });
    }
}
