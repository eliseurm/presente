import {PapelEnum} from "@/shared/model/enum/papel.enum";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export interface UsuarioDto {
    id?: number;
    username?: string;
    senha?: string; // Usado apenas para envio de nova senha
    papel?: PapelEnum;
    status?: StatusEnum;
    criadoEm?: Date;
    alteradoEm?: Date;
    version?: number;
}
