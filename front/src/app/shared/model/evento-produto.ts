import {Produto} from '@/shared/model/produto';

export class EventoProduto {

    id?: number;
    produto!: Produto | { id: number };
    status?: any; // StatusEnum

}
