import {BaseFilter} from "@/shared/model/core/base-filter";
import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";

export class TamanhoFilter extends BaseFilter {

    tipo!: ProdutoTipoEnum;
    tamanho!: string;

    constructor(init?: Partial<TamanhoFilter>) {
        super();
        Object.assign(this, init);
    }
}
