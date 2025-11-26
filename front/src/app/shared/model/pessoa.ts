// src/app/shared/model/pessoa.model.ts
export class Pessoa {
    id?: number;
    nome?: string;
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
