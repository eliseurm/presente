import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Produto } from '@/shared/model/produto';
import { ProdutoFilter } from '@/shared/model/filter/produto-filter';
import {ProdutoDto} from "@/shared/model/dto/produto-dto";
import {map, Observable} from "rxjs";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoPessoaMapper} from "@/shared/model/mapper/evento-pessoa-mapper";
import {Imagem} from "@/shared/model/imagem";

@Injectable({ providedIn: 'root' })
export class ProdutoService extends BaseCrudService<Produto, ProdutoFilter, ProdutoDto> {
  protected apiUrl = '/api/produto';

  constructor(http: HttpClient) {
    super(http);
  }

    getProdutoImagem(produtoId: number): Observable<Imagem[]> {
        return this.http.get<Imagem[]>(`${this.apiUrl}/${produtoId}/imagem/list`);
    }


}
