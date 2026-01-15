import { UsuarioDto } from './usuario-dto';
import {StatusEnum} from "@/shared/model/enum/status.enum";

export interface ClienteDto {
    id?: number;
    nome?: string;
    email?: string;
    telefone?: string;
    usuario?: UsuarioDto;
    anotacoes?: string;
    status?: StatusEnum;
    criadoEm?: Date;
    alteradoEm?: Date;
    version?: number;
}
