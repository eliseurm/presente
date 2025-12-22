import {StatusEnum} from "@/shared/model/enum/status.enum";
import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";

/**
 * Interface que representa o DTO de Escolha de Evento
 * (Correspondente a EventoEscolhaDTO.java)
 */
export interface EventoEscolhaDto {
    // --- Campos de EventoEscolha ---
    id: number;
    dataEscolha: string; // LocalDateTime é serializado como String (ISO 8601)
    alteradoEm: string;   // LocalDateTime é serializado como String (ISO 8601)
    status: StatusEnum; // Exemplo de StatusEnum

    // --- Informações de Evento ---
    eventoId: number;
    eventoNome: string;
    eventoStatus: StatusEnum; // Exemplo de StatusEnum

    // --- Informações de Pessoa ---
    pessoaId: number;
    pessoaNome: string;
    pessoaTelefone: string;
    pessoaEmail: string;

    // --- Informações de Produto ---
    produtoId: number;
    produtoNome: string;
    produtoDescricao: string;
    produtoStatus: StatusEnum;

    // --- Informações de Cor ---
    corId: number;
    corNome: string;
    corHex: string;

    // --- Informações de Tamanho ---
    tamanhoId: number;
    tamanhoDescricao: string;
    tamanhoTipoProduto: ProdutoTipoEnum; // Mapeado de ProdutoTipoEnum
}
