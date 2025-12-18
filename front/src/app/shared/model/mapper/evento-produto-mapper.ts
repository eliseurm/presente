import { EventoProdutoDTO } from '../dto/evento-produto-dto'; // Arquivo evento-produto-dto.ts
import { StatusEnum } from "@/shared/model/enum/status.enum";
import {EventoProduto} from "@/shared/model/evento-produto";
import {Produto} from "@/shared/model/produto";
import {EventoPessoaDTO} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoPessoa} from "@/shared/model/evento-pessoa"; // Assumindo o caminho

export class EventoProdutoMapper {

    /**
     * Converte EventoProdutoDTO (API) para EventoProduto (Modelo Local).
     * @param dto O DTO recebido da API.
     * @returns O modelo EventoProduto.
     */
    public static fromDTO(dto: EventoProdutoDTO): EventoProduto | undefined {
        if (!dto) return undefined;

        const produto = new Produto();
        produto.id = dto.produtoId;
        produto.nome = dto.produtoNome;

        return {
            id: dto.id,
            produto: produto,
            status: dto.status,
        };
    }

    /**
     * Converte EventoProduto (Modelo Local) para EventoProdutoDTO (API).
     * @param model O modelo EventoProduto local.
     * @returns O DTO a ser enviado para a API.
     */
    public static toDTO(model: EventoProduto): EventoProdutoDTO | undefined{
        if (!model) return undefined;

        // Assume que 'produto' pode ser um objeto parcial { id: number }
        const produtoId = model.produto && 'id' in model.produto ? model.produto.id : undefined;
        // Assume que se o objeto 'produto' contiver 'nome', ele deve ser usado.
        const produtoNome = model.produto && 'nome' in model.produto ? (model.produto as any).nome : undefined;

        return {
            id: model.id,
            produtoId: produtoId,
            produtoNome: produtoNome,
            status: model.status as StatusEnum,
        };
    }

    static toDtoList(entities: any[]): EventoProdutoDTO[] {
        if (!entities) return [];
        return entities.map(entity => this.toDTO(entity))
            .filter(dto => !!dto) as EventoProdutoDTO[];
    }

    static listFromDto(dtos: EventoProdutoDTO[]): EventoProduto[] {
        if (!dtos) return [];
        return dtos.map(dto => this.fromDTO(dto)).filter(dto => !!dto) as EventoProduto[];
    }

}
