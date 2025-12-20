import {Cor} from '@/shared/model/cor';
import {Tamanho} from '@/shared/model/tamanho';
import {Imagem} from '@/shared/model/imagem';
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class Produto {

    id?: number;
    nome?: string;
    descricao?: string;
    preco?: number;
    status?: StatusEnum;
    cores?: Cor[];
    tamanhos?: Tamanho[];
    imagens?: Imagem[];

}
