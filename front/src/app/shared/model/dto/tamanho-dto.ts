import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";

export interface TamanhoDto {
    id?: number;
    tipo?: ProdutoTipoEnum;
    tamanho?: string;
    version?: number;
}
