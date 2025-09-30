// src/app/shared/model/filter/pessoa-filter.ts
import { BaseFilter } from './base-filter';

export interface PessoaFilter extends BaseFilter {
    nome?: string;
    email?: string;
    telefone?: string;
    status?: string;
}
