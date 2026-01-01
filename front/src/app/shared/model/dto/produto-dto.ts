import { ImagemDto } from '@/shared/model/dto/imagem-dto';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { ProdutoEstoqueDto } from '@/shared/model/dto/produto-estoque-dto';

export interface ProdutoDto {
    id?: number;
    nome?: string;
    descricao?: string;
    preco?: number;
    status?: StatusEnum;
    imagens?: ImagemDto[];
    estoques?: ProdutoEstoqueDto[];
    version?: number;
}
