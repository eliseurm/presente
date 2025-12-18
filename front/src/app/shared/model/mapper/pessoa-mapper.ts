// pessoa.mapper.ts

import {PessoaDTO} from "@/shared/model/dto/pessoa-dto";
import {Pessoa} from "@/shared/model/pessoa";
import {EventoPessoa} from "@/shared/model/evento-pessoa";

export class PessoaMapper {

    /**
     * Entidade -> DTO (Prepara dados vindo da API para o componente)
     */
    static toDTO(entity: any): PessoaDTO | undefined{
        if (!entity) return undefined;

        return {
            id: entity.id,
            clienteId: entity.cliente ? entity.cliente.id : null,
            nome: entity.nome,
            cpf: entity.cpf,
            telefone: entity.telefone,
            email: entity.email,
            status: entity.status,
            endereco: entity.endereco,
            complemento: entity.complemento,
            cidade: entity.cidade,
            estado: entity.estado,
            cep: entity.cep,
            senha: entity.senha
        };
    }

    /**
     * DTO -> Entidade (Prepara dados do formulário para enviar à API)
     */
    static fromDTO(dto: PessoaDTO): Pessoa | undefined {
        if (!dto) return undefined;

        const pessoa = new Pessoa();

        // Copia todas as propriedades simples que possuem o mesmo nome
        Object.assign(pessoa, dto);

        // Trata a conversão de clienteId (number) para o objeto cliente ({id: number})
        if (dto.clienteId) {
            pessoa.cliente = { id: dto.clienteId };
        }
        else {
            pessoa.cliente = undefined;
        }

        return pessoa;
    }

    static toDtoList(entities: any[]): PessoaDTO[] {
        if (!entities) return [];
        return entities.map(entity => this.toDTO(entity))
            .filter(dto => !!dto) as PessoaDTO[];
    }

    static listFromDto(dtos: PessoaDTO[]): Pessoa[] {
        if (!dtos) return [];
        return dtos.map(dto => this.fromDTO(dto)).filter(dto => !!dto) as Pessoa[];
    }
}
