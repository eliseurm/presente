import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Tamanho } from '@/shared/model/tamanho';
import { TamanhoFilter } from '@/shared/model/filter/tamanho-filter';

@Injectable({
    providedIn: 'root'
})
export class TamanhoService extends BaseCrudService<Tamanho, TamanhoFilter> {
    protected apiUrl = '/api/tamanho';

    constructor(http: HttpClient) {
        super(http);
    }
}
