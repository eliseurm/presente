import {StatusEnum} from "@/shared/model/enum/status.enum";

export class EventoPessoaDTO {

    pessoaId?: number;
    pessoaNome?: string;

    status?: StatusEnum;
    nomeMagicNumber?: string;

    jaEscolheu?: boolean;

}
