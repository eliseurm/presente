import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Produto } from '@/shared/model/produto';
import { ProdutoFilter } from '@/shared/model/filter/produto-filter';

@Injectable({ providedIn: 'root' })
export class ProdutoService extends BaseCrudService<Produto, ProdutoFilter> {
  protected apiUrl = '/api/produto';

  constructor(http: HttpClient) {
    super(http);
  }
}
