import { ProdutoEstoque } from '@/shared/model/produto-estoque';
import { ProdutoEstoqueDto } from '@/shared/model/dto/produto-estoque-dto';
import { CorMapper } from '@/shared/model/mapper/cor-mapper';
import { TamanhoMapper } from '@/shared/model/mapper/tamanho-mapper';
import { StatusEnum } from '@/shared/model/enum/status.enum';

export class ProdutoEstoqueMapper {

    static toDto(entity: ProdutoEstoque): ProdutoEstoqueDto {
        if (!entity) return undefined as any;

        // Cria o DTO. Se preferir usar o construtor da classe DTO:
        // return new ProdutoEstoqueDto({ ... });
        // Aqui retornamos um objeto compatível com a interface/classe:
        return {
            id: entity.id,
            produtoId: entity.produto?.id, // Mapeia o ID do objeto produto se existir
            cor: entity.cor ? CorMapper.toDto(entity.cor) : undefined,
            tamanho: entity.tamanho ? TamanhoMapper.toDto(entity.tamanho) : undefined,
            preco: entity.preco,
            quantidade: entity.quantidade,
            status: StatusEnum.toKey(entity.status),
            version: entity.version
        } as ProdutoEstoqueDto;
    }

    static fromDto(dto: ProdutoEstoqueDto): ProdutoEstoque {
        if (!dto) return undefined as any;

        const entity = new ProdutoEstoque();

        entity.id = dto.id;
        // O entity.produto geralmente é um objeto, mas vindo do DTO temos o ID.
        // Dependendo da sua implementação do Model, você pode precisar instanciar um Produto parcial:
        if (dto.produtoId) {
            // Assumindo que ProdutoEstoque tem uma propriedade 'produto' do tipo Produto ou {id: number}
            entity.produto = { id: dto.produtoId } as any;
        }

        entity.cor = dto.cor ? CorMapper.fromDto(dto.cor) : undefined;
        entity.tamanho = dto.tamanho ? TamanhoMapper.fromDto(dto.tamanho) : undefined;
        entity.preco = dto.preco;
        entity.quantidade = dto.quantidade;
        entity.status = dto.status;
        entity.version = dto.version;

        return entity;
    }

    static toDtoList(entities: ProdutoEstoque[]): ProdutoEstoqueDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: ProdutoEstoqueDto[]): ProdutoEstoque[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
