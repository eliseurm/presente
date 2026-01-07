import {BaseFilter} from '@/shared/model/filter/base-filter';

export class EventoPessoaFilter extends BaseFilter {

    id?: number;

    eventoId?: number;

    pessoaId?: number;
    pessoaNome?: string;
    pessoaCpf?: string;
    pessoaEmail?: string;
    pessoaTelefone?: string;

    constructor(init?: Partial<EventoPessoaFilter>) {
        super();
        Object.assign(this, init);
    }
}
