import { Produto } from '@/shared/model/produto';
import { ProdutoDto } from '@/shared/model/dto/produto-dto';
import { ImagemMapper } from '@/shared/model/mapper/imagem-mapper';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { ProdutoEstoqueMapper } from '@/shared/model/mapper/produto-estoque-mapper';

export class ProdutoMapper {
    static toDto(entity: Produto): ProdutoDto {
        if (!entity) return {} as ProdutoDto;

        entity.status = StatusEnum.toKey(entity.status);

        return {
            ...entity,
            estoques: ProdutoEstoqueMapper.toDtoList(entity.estoques || []),
            imagens: ImagemMapper.toDtoList(entity.imagens || [])
        };
    }

    static fromDto(dto: ProdutoDto): Produto {
        if (!dto) return new Produto();

        let statusEnum: any = dto.status;
        if (typeof dto.status === 'string') {
            statusEnum = StatusEnum[dto.status as keyof typeof StatusEnum] ?? dto.status;
        }

        const entity = new Produto();
        entity.id = dto.id;
        entity.nome = dto.nome;
        entity.descricao = dto.descricao;
        entity.preco = dto.preco;
        entity.status = statusEnum as StatusEnum;
        entity.estoques = ProdutoEstoqueMapper.fromDtoList(dto.estoques || []);
        entity.imagens = ImagemMapper.fromDtoList(dto.imagens || []);
        entity.version = dto.version;
        return entity;
    }

    static toDtoList(entities: Produto[]): ProdutoDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: ProdutoDto[]): Produto[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
