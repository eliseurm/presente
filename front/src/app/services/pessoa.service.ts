// src/app/services/pessoa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../shared/services/base-crud.service';
import { PessoaFilter } from '../shared/model/filter/pessoa-filter';
import { Observable } from 'rxjs';
import {Pessoa} from "@/shared/model/pessoa";

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
}
