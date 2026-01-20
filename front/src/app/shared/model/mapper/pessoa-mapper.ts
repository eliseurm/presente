// pessoa.mapper.ts

import {PessoaDto} from "@/shared/model/dto/pessoa-dto";
import {Pessoa} from "@/shared/model/pessoa";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {ProdutoDto} from "@/shared/model/dto/produto-dto";
import {ClienteMapper} from "@/shared/model/mapper/cliente-mapper";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class PessoaMapper {

    /**
     * Entidade -> DTO (Prepara dados vindo da API para o componente)
     */
    static toDTO(entity: any): PessoaDto {
        if (!entity) return {} as PessoaDto;

        return {
            id: entity.id,
            cliente: ClienteMapper.toDto(entity.cliente),
            nome: entity.nome,
            cpf: entity.cpf,
            telefone: entity.telefone,
            email: entity.email,
            status: StatusEnum.toKey(entity.status),
            endereco: entity.endereco,
            complemento: entity.complemento,
            cidade: entity.cidade,
            estado: entity.estado,
            cep: entity.cep,
            senha: entity.senha,
            version: entity.version
        };
    }

    /**
     * DTO -> Entidade (Prepara dados do formulário para enviar à API)
     */
    static fromDTO(dto: PessoaDto): Pessoa {
        if (!dto) return new Pessoa();

        const pessoa = new Pessoa();

        // Copia todas as propriedades simples que possuem o mesmo nome
        Object.assign(pessoa, dto);

        // Trata a conversão de clienteId (number) para o objeto cliente ({id: number})
        if (dto.cliente) {
            pessoa.cliente = ClienteMapper.fromDto(dto.cliente);
        }
        else {
            pessoa.cliente = undefined;
        }

        return pessoa;
    }

    static toDtoList(entities: any[]): PessoaDto[] {
        if (!entities) return [];
        return entities.map(entity => this.toDTO(entity))
            .filter(dto => !!dto) as PessoaDto[];
    }

    static listFromDto(dtos: PessoaDto[]): Pessoa[] {
        if (!dtos) return [];
        return dtos.map(dto => this.fromDTO(dto)).filter(dto => !!dto) as Pessoa[];
    }
}
