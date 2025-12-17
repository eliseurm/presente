import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoProdutoDTO {

    id?: number;

    produtoId?: number;
    produtoNome?: string;

    status?: StatusEnum;

}
