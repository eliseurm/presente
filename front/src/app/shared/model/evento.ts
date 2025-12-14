import {Cliente} from '@/shared/model/cliente';
import {EventoPessoa} from '@/shared/model/evento-pessoa';
import {EventoProduto} from '@/shared/model/evento-produto';
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {EventoEscolhaDTO} from "@/shared/model/dto/evento-escolha-dto";
import {EventoEscolha} from "@/shared/model/evento-escolha";

export class Evento {

    id?: number;
    nome?: string;
    descricao?: string;
    cliente?: Cliente | { id: number };
    status?: StatusEnum;
    anotacoes?: string;
    inicio?: string | Date;
    fimPrevisto?: string | Date;
    fim?: string | Date;

    pessoas?: EventoPessoa[];
    produtos?: EventoProduto[];
    escolhas?: EventoEscolha[];

    // Concorrência otimista
    version?: number;
}
