import {StatusEnum} from "@/shared/model/enum/status.enum";
import {ProdutoDto} from "@/shared/model/dto/produto-dto";

export class EventoProdutoDto {

    id?: number;

    produto?: ProdutoDto | undefined;

    status?: StatusEnum;

}
