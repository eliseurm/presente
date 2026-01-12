// src/app/shared/model/filter/pessoa-filter.ts
import { BaseFilter } from '../core/base-filter';

export class PessoaFilter extends BaseFilter {

    id?: number;

    clienteId?: number;

    nome?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    status?: string;

    constructor(init?: Partial<PessoaFilter>) {
        super();
        Object.assign(this, init);
    }

}
