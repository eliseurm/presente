import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import {Cor} from "@/shared/model/cor";
import {CorFilter} from "@/shared/model/filter/cor-filter";

@Injectable({ providedIn: 'root' })
export class CorService extends BaseCrudService<Cor, CorFilter> {
    protected apiUrl = '/api/cor';

    constructor(http: HttpClient) {
        super(http);
    }

}
