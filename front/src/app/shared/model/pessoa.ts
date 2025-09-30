// src/app/shared/model/pessoa.model.ts
export interface Pessoa {
    id?: number;
    nome: string;
    email: string;
    telefone: string;
    status: string;
    criadoEm?: string;
    alteradoEm?: string;
}
