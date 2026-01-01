import { Imagem } from '@/shared/model/imagem';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { ProdutoEstoque } from './produto-estoque'; // Certifique-se de importar

export class Produto {
    id?: number;
    nome?: string;
    descricao?: string;
    preco?: number;
    status?: StatusEnum;
    imagens?: Imagem[];
    estoques?: ProdutoEstoque[];
    version?: number;
}
