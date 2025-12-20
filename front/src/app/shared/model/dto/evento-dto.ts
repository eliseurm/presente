// Assumindo a definição do Enum StatusEnum
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoProdutoDto} from "@/shared/model/dto/evento-produto-dto";
import {EventoEscolhaDto} from "@/shared/model/dto/evento-escolha-dto";

export class EventoDto {

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

    eventoPessoas?: EventoPessoaDto[];
    eventoProdutos?: EventoProdutoDto[];

    version?: number | undefined;

}
