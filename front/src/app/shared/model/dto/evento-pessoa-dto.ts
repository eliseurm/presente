import {StatusEnum} from "@/shared/model/enum/status.enum";
import {PessoaDto} from "@/shared/model/dto/pessoa-dto";

export class EventoPessoaDto {

    id?: number;
    pessoa?: PessoaDto;
    status?: StatusEnum;
    nomeMagicNumber?: string;
    jaEscolheu?: boolean;
    version?: number;

}
