import {BaseFilter} from "@/shared/model/filter/base-filter";
import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";

export interface TamanhoFilter extends BaseFilter {

    tipo: ProdutoTipoEnum;
    tamanho: string;

}
