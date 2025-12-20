import {Produto} from "@/shared/model/produto";
import {ProdutoDto} from "@/shared/model/dto/produto-dto";
import {CorMapper} from "@/shared/model/mapper/cor-mapper";
import {TamanhoMapper} from "@/shared/model/mapper/tamanho-mapper";
import {ImagemMapper} from "@/shared/model/mapper/imagem-mapper";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class ProdutoMapper {

    static toDto(entity: Produto): ProdutoDto {
        if (!entity) return {} as ProdutoDto;

        let statusFinal: any = entity.status;
        if (entity.status && typeof entity.status === 'object') {
            statusFinal = (entity.status as any).key ?? (entity.status as any).name ?? entity.status;
        }

        entity.status = statusFinal as StatusEnum;

        return {
            ...entity,
            cores: CorMapper.toDtoList(entity.cores || []),
            tamanhos: TamanhoMapper.toDtoList(entity.tamanhos || []),
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
        entity.cores = CorMapper.fromDtoList(dto.cores || []);
        entity.tamanhos = TamanhoMapper.fromDtoList(dto.tamanhos || []);
        entity.imagens = ImagemMapper.fromDtoList(dto.imagens || []);
        return entity;
    }

    static toDtoList(entities: Produto[]): ProdutoDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: ProdutoDto[]): Produto[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
