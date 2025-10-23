import {BaseFilter} from '@/shared/model/filter/base-filter';

export class EventoFilter extends BaseFilter {

    nome?: string;
    clienteId?: number;
    status?: string;

    constructor(init?: Partial<EventoFilter>) {
        super();
        Object.assign(this, init);
    }
}
