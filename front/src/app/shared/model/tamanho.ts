import { ProdutoTipoEnum } from './enum/produto-tipo.enum';

export class Tamanho {

    id?: number;
    tipo?: ProdutoTipoEnum;
    tamanho?: string;
    // Controle de concorrência otimista (alinhado com o back-end @Version)
    version?: number;

}
