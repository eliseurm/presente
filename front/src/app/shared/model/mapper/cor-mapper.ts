import {Cor} from "@/shared/model/cor";
import {CorDto} from "@/shared/model/dto/cor-dto";

export class CorMapper {
    static toDto(entity: Cor): CorDto {
        return { ...entity };
    }

    static fromDto(dto: CorDto): Cor {
        const entity = new Cor();
        Object.assign(entity, dto);
        return entity;
    }

    static toDtoList(entities: Cor[]): CorDto[] {
        return entities ? entities.map(this.toDto) : [];
    }

    static fromDtoList(dtos: CorDto[]): Cor[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }
}
