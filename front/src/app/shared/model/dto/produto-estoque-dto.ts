import { StatusEnum } from '../enum/status.enum';
import { CorDto } from '@/shared/model/dto/cor-dto';
import { TamanhoDto } from '@/shared/model/dto/tamanho-dto'; // Ajuste o caminho conforme necessário

export class ProdutoEstoqueDto {
    id?: number;
    produtoId?: number;

    cor?: CorDto;
    tamanho?: TamanhoDto;

    preco?: number;
    quantidade?: number;
    status?: StatusEnum;
    version?: number;

}


