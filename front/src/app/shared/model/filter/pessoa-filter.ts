// src/app/shared/model/filter/pessoa-filter.ts
import { BaseFilter } from './base-filter';

export class PessoaFilter extends BaseFilter {
    nome?: string;
    email?: string;
    telefone?: string;
    status?: string;

    constructor(init?: Partial<PessoaFilter>) {
        super();
        Object.assign(this, init);
    }
}
