// pessoa.dto.ts

import {StatusEnum} from "@/shared/model/enum/status.enum";
import {ClienteDto} from "@/shared/model/dto/cliente-dto";

export interface PessoaDto {
    id?: number;
    cliente?: ClienteDto;
    nome?: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    status?: StatusEnum;
    endereco?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    senha?: string;
    criadoEm?: Date;
    alteradoEm?: Date;
    version?: number;
}
