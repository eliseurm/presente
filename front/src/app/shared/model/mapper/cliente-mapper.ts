import {ClienteDto} from "@/shared/model/dto/cliente-dto";
import {Cliente} from "@/shared/model/cliente";

export class ClienteMapper {

    static toDto(cliente: Cliente): ClienteDto {
        if (!cliente) return null!;

        return { ...cliente };
    }

    static fromDto(dto: ClienteDto): Cliente {
        const entity = new Cliente();
        Object.assign(entity, dto);
        return entity;
    }

    static toDtoList(list: any[]): ClienteDto[] {
        return list ? list.map(item => this.toDto(item)) : [];
    }

    static fromDtoList(dtos: ClienteDto[]): Cliente[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }

}
