import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoProdutoDTO {

    produtoId?: number;
    produtoNome?: string;

    status?: StatusEnum;

}
