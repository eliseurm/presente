import {UsuarioDto} from "@/shared/model/dto/usuario-dto";
import {Usuario} from "@/shared/model/usuario";

export class UsuarioMapper {

    static toDto(usuario: Usuario): UsuarioDto {
        if (!usuario) return null!;

        return { ...usuario };
    }

    static fromDto(dto: UsuarioDto): Usuario {
        const entity = new Usuario();
        Object.assign(entity, dto);
        return entity;
    }

    static toDtoList(list: any[]): UsuarioDto[] {
        return list ? list.map(item => this.toDto(item)) : [];
    }

    static fromDtoList(dtos: UsuarioDto[]): Usuario[] {
        return dtos ? dtos.map(this.fromDto) : [];
    }

}
