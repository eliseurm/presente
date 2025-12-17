// src/app/shared/model/pessoa.model.ts
import {Cliente} from "@/shared/model/cliente";

export class Pessoa {

    id?: number;

    cliente?: Cliente;

    nome?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    status?: string;

    endereco?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
    cep?: string;

    criadoEm?: string;
    alteradoEm?: string;
}
