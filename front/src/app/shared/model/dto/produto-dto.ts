import {CorDto} from "@/shared/model/dto/cor-dto";
import {TamanhoDto} from "@/shared/model/dto/tamanho-dto";
import {ImagemDto} from "@/shared/model/dto/imagem-dto";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export interface ProdutoDto {
    id?: number;
    nome?: string;
    descricao?: string;
    preco?: number;
    status?: StatusEnum;
    cores?: CorDto[];
    tamanhos?: TamanhoDto[];
    imagens?: ImagemDto[];
}
