import {BaseFilter} from "@/shared/model/filter/base-filter";

export class CorFilter extends BaseFilter {
    nome?: string;

    constructor(init?: Partial<CorFilter>) {
        super();
        Object.assign(this, init);
    }
}
