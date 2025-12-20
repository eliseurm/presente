import { EventoProdutoDto } from '../dto/evento-produto-dto'; // Arquivo evento-produto-dto.ts
import { StatusEnum } from "@/shared/model/enum/status.enum";
import {EventoProduto} from "@/shared/model/evento-produto";
import {Produto} from "@/shared/model/produto";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {ProdutoMapper} from "@/shared/model/mapper/produto-mapper"; // Assumindo o caminho

export class EventoProdutoMapper {

    /**
     * Converte EventoProdutoDTO (API) para EventoProduto (Modelo Local).
     * @param dto O DTO recebido da API.
     * @returns O modelo EventoProduto.
     */
    public static fromDTO(dto: EventoProdutoDto): EventoProduto | undefined {
        if (!dto) return undefined;

        const produto = dto.produto ? ProdutoMapper.fromDto(dto.produto) : new Produto();

        let statusEnum: any = dto.status;
        if (typeof dto.status === 'string') {
            statusEnum = StatusEnum[dto.status as keyof typeof StatusEnum] ?? dto.status;
        }

        return {
            id: dto.id,
            produto: produto,
            status: statusEnum as StatusEnum,
        };
    }

    /**
     * Converte EventoProduto (Modelo Local) para EventoProdutoDTO (API).
     * @param model O modelo EventoProduto local.
     * @returns O DTO a ser enviado para a API.
     */
    public static toDTO(model: EventoProduto): EventoProdutoDto | undefined{
        if (!model) return undefined;

        const produtoDto = model.produto ? ProdutoMapper.toDto(model.produto) : undefined;


        let statusFinal: any = model.status;
        if (model.status && typeof model.status === 'object') {
            statusFinal = (model.status as any).key ?? (model.status as any).name ?? model.status;
        }

        return {
            id: model.id,
            produto: produtoDto,
            status: statusFinal as StatusEnum,
        };
    }

    static toDtoList(entities: any[] | undefined): EventoProdutoDto[] {
        if (!entities) return [];
        return entities.map(entity => this.toDTO(entity))
            .filter(dto => !!dto) as EventoProdutoDto[];
    }

    static listFromDto(dtos: EventoProdutoDto[]): EventoProduto[] {
        if (!dtos) return [];
        return dtos.map(dto => this.fromDTO(dto)).filter(dto => !!dto) as EventoProduto[];
    }

}
