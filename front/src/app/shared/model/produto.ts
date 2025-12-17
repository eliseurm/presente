import {Cor} from '@/shared/model/cor';
import {Tamanho} from '@/shared/model/tamanho';
import {Imagem} from '@/shared/model/imagem';

export class Produto {

    id?: number;
    nome?: string;
    descricao?: string;
    preco?: number;
    status?: boolean;
    cores?: Cor[];
    tamanhos?: Tamanho[];
    imagens?: Imagem[];

}
