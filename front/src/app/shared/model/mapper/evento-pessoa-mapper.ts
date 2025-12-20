import { EventoPessoaDto } from '../dto/evento-pessoa-dto'; // Arquivo evento-pessoa-dto.ts
import { StatusEnum } from "@/shared/model/enum/status.enum";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {Pessoa} from "@/shared/model/pessoa";
import {PessoaDto} from "@/shared/model/dto/pessoa-dto"; // Assumindo o caminho

export class EventoPessoaMapper {

    /**
     * Converte EventoPessoaDTO (API) para EventoPessoa (Modelo Local).
     * @param dto O DTO recebido da API.
     * @returns O modelo EventoPessoa.
     */
    public static fromDTO(dto: EventoPessoaDto): EventoPessoa | undefined{
        if (!dto) return undefined;

        const pessoa = new Pessoa()
        pessoa.id = dto.pessoaId;
        pessoa.nome = dto.pessoaNome;

        return {
            id: dto.id,
            pessoa: pessoa,
            status: dto.status,
            nomeMagicNumber: dto.nomeMagicNumber,
            jaEscolheu: dto.jaEscolheu,
        };
    }

    /**
     * Converte EventoPessoa (Modelo Local) para EventoPessoaDTO (API).
     * @param model O modelo EventoPessoa local.
     * @returns O DTO a ser enviado para a API.
     */
    public static toDTO(model: EventoPessoa): EventoPessoaDto | undefined{
        if (!model) return undefined;

        // Assume que 'pessoa' pode ser um objeto parcial { id: number }
        const pessoaId = model.pessoa && 'id' in model.pessoa ? model.pessoa.id : undefined;
        // Assume que se o objeto 'pessoa' contiver 'nome', ele deve ser usado.
        const pessoaNome = model.pessoa && 'nome' in model.pessoa ? (model.pessoa as any).nome : undefined;

        return {
            id: model.id,
            pessoaId: pessoaId,
            pessoaNome: pessoaNome,
            status: model.status as StatusEnum,
            nomeMagicNumber: model.nomeMagicNumber,
            jaEscolheu: model.jaEscolheu,
        };
    }

    static toDtoList(entities: any[] | undefined): EventoPessoaDto[] {
        if (!entities) return [];
        return entities.map(entity => this.toDTO(entity))
            .filter(dto => !!dto) as EventoPessoaDto[];
    }

    static listFromDto(dtos: EventoPessoaDto[]): EventoPessoa[] {
        if (!dtos) return [];
        return dtos.map(dto => this.fromDTO(dto)).filter(dto => !!dto) as EventoPessoa[];
    }

}
