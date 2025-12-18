// Assumindo a definição do Enum StatusEnum
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {EventoPessoaDTO} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoProdutoDTO} from "@/shared/model/dto/evento-produto-dto";
import {EventoEscolhaDTO} from "@/shared/model/dto/evento-escolha-dto";

export class EventoDTO {

    id?: number;
    nome?: string;
    descricao?: string;

    clienteId?: number;
    clienteNome?: string;

    status?: StatusEnum;
    anotacoes?: string;
    inicio?: Date;
    fimPrevisto?: Date;
    fim?: Date;

    eventoPessoas?: EventoPessoaDTO[];
    eventoProdutos?: EventoProdutoDTO[];

    version?: number | undefined;

}
