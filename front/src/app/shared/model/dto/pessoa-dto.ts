// pessoa.dto.ts

import {StatusEnum} from "@/shared/model/enum/status.enum";

export interface PessoaDto {

    id?: number;
    clienteId?: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    status?: StatusEnum;
    endereco?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    senha?: string;
    criadoEm?: Date;
    alteradoEm?: Date;

}
