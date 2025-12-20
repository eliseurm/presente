import {Imagem} from "@/shared/model/imagem";
import {ImagemDto} from "@/shared/model/dto/imagem-dto";

export class ImagemMapper {
    static toDto(entity: Imagem): ImagemDto {
        return { ...entity };
    }

    static fromDto(dto: ImagemDto): Imagem {
        const entity = new Imagem();
        Object.assign(entity, dto);
        return entity;
    }

    static toDtoList(entities: Imagem[]): ImagemDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: ImagemDto[]): Imagem[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
