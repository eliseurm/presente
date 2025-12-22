import {EventoEscolha} from "@/shared/model/evento-escolha";
import {EventoEscolhaDto} from "@/shared/model/dto/evento-escolha-dto";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoEscolhaMapper {

    /**
     * Converte uma Entidade (com objetos aninhados) para um DTO (achatado)
     */
    static toDto(entity: EventoEscolha): EventoEscolhaDto {
        if (!entity) return {} as EventoEscolhaDto;

        return {
            id: entity.id!,
            dataEscolha: entity.dataEscolha ? entity.dataEscolha.toISOString() : '',
            alteradoEm: entity.alteradoEm ? entity.alteradoEm.toISOString() : '',
            status: entity.status!,

            // Mapeamento de Evento
            eventoId: entity.evento?.id!,
            eventoNome: entity.evento?.nome || '',
            eventoStatus: entity.evento?.status!,

            // Mapeamento de Pessoa
            pessoaId: entity.pessoa?.id!,
            pessoaNome: entity.pessoa?.nome || '',
            pessoaTelefone: entity.pessoa?.telefone || '',
            pessoaEmail: entity.pessoa?.email || '',

            // Mapeamento de Produto
            produtoId: entity.produto?.id!,
            produtoNome: entity.produto?.nome || '',
            produtoDescricao: entity.produto?.descricao || '',
            produtoStatus: entity.produto?.status || StatusEnum.ATIVO,

            // Mapeamento de Cor
            corId: entity.cor?.id!,
            corNome: entity.cor?.nome || '',
            corHex: entity.cor?.corHex || '',

            // Mapeamento de Tamanho
            tamanhoId: entity.tamanho?.id!,
            tamanhoDescricao: entity.tamanho?.tamanho || '',
            tamanhoTipoProduto: entity.tamanho?.tipo!
        };
    }

    /**
     * Converte um DTO para uma Entidade estruturada
     */
    static fromDto(dto: EventoEscolhaDto): EventoEscolha {
        if (!dto) return new EventoEscolha();

        const entity = new EventoEscolha();
        entity.id = dto.id;
        entity.status = dto.status;
        entity.dataEscolha = dto.dataEscolha ? new Date(dto.dataEscolha) : undefined;
        entity.alteradoEm = dto.alteradoEm ? new Date(dto.alteradoEm) : undefined;

        // Reconstruindo objetos aninhados (apenas com IDs para salvar no back)
        entity.evento = dto.eventoId ? {id: dto.eventoId, nome: dto.eventoNome, status: dto.eventoStatus} : undefined;
        entity.pessoa = dto.pessoaId ? {id: dto.pessoaId, nome: dto.pessoaNome} : undefined;
        entity.produto = dto.produtoId ? {id: dto.produtoId, nome: dto.produtoNome} : undefined;
        entity.cor = dto.corId ? {id: dto.corId, nome: dto.corNome} : undefined;
        entity.tamanho = dto.tamanhoId ? {id: dto.tamanhoId, tamanho: dto.tamanhoDescricao} : undefined;

        return entity;
    }

    static toDtoList(entities: EventoEscolha[]): EventoEscolhaDto[] {
        return entities ? entities.map(entity => this.toDto(entity)) : [];
    }

    static fromDtoList(dtos: EventoEscolhaDto[]): EventoEscolha[] {
        return dtos ? dtos.map(dto => this.fromDto(dto)) : [];
    }
}
