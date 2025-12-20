import {Tamanho} from "@/shared/model/tamanho";
import {TamanhoDto} from "@/shared/model/dto/tamanho-dto";

export class TamanhoMapper {
    static toDto(entity: Tamanho): TamanhoDto {
        return { ...entity };
    }

    static fromDto(dto: TamanhoDto): Tamanho {
        const entity = new Tamanho();
        Object.assign(entity, dto);
        return entity;
    }

    static toDtoList(entities: Tamanho[]): TamanhoDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: TamanhoDto[]): Tamanho[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
