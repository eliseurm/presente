import { EventoProdutoDTO } from './evento-produto-dto'; // Arquivo evento-produto-dto.ts
import { StatusEnum } from "@/shared/model/enum/status.enum";
import {EventoProduto} from "@/shared/model/evento-produto";
import {Produto} from "@/shared/model/produto"; // Assumindo o caminho

export class EventoProdutoMapper {

    /**
     * Converte EventoProdutoDTO (API) para EventoProduto (Modelo Local).
     * @param dto O DTO recebido da API.
     * @returns O modelo EventoProduto.
     */
    public static fromDTO(dto: EventoProdutoDTO): EventoProduto | undefined {
        if (!dto) return undefined;

        const produto = new Produto();
        produto.id = dto.id;
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
            produtoId: produtoId,
            produtoNome: produtoNome,
            status: model.status as StatusEnum,
        };
    }
}
