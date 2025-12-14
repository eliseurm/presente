import {Evento} from "@/shared/model/evento";
import {Pessoa} from "@/shared/model/pessoa";
import {Produto} from "@/shared/model/produto";
import {Cor} from "@/shared/model/cor";
import {Tamanho} from "@/shared/model/tamanho";
import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoEscolha {

    id?: number;
    evento?: Evento;
    pessoa?: Pessoa;
    produto?: Produto;
    cor?: Cor;
    tamanho?: Tamanho;

    status?: StatusEnum;

    dataEscolha?: Date;
    alteradoEm?: Date;

}
