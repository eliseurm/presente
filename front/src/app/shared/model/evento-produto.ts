import {Produto} from '@/shared/model/produto';
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoProduto {

    id?: number;
    produto!: Produto;
    status?: StatusEnum; // StatusEnum

}
