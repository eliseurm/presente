import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoPessoaDTO {

    id?: number;

    pessoaId?: number;
    pessoaNome?: string;

    status?: StatusEnum;
    nomeMagicNumber?: string;

    jaEscolheu?: boolean;

}
