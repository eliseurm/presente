import { StatusEnum } from '@/shared/model/enum/status.enum';
import { Cor } from '@/shared/model/cor';
import { Tamanho } from '@/shared/model/tamanho';
import { Produto } from '@/shared/model/produto';

export class ProdutoEstoque {

    id?: number;
    produto?: Produto;
    tamanho?: Tamanho;
    cor?: Cor;
    preco?: number;
    quantidade?: number;
    status?: StatusEnum;
    criadoEm?: Date;
    alteradoEm?: Date;
    version?: number;

    constructor(init?: Partial<ProdutoEstoque>) {
        if (init) {
            Object.assign(this, init);
        }
    }

}
