import {BaseFilter} from '@/shared/model/core/base-filter';

export class EventoPessoaFilter extends BaseFilter {

    id?: number;

    eventoId?: number;

    pessoaId?: number;
    pessoaNome?: string;
    pessoaCpf?: string;
    pessoaEmail?: string;
    pessoaTelefone?: string;

    jaEscolheu: boolean | null = null;
    temLinkMagico: boolean | null = null;

    constructor(init?: Partial<EventoPessoaFilter>) {
        super();
        Object.assign(this, init);
    }
}
