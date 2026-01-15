import {Pessoa} from '@/shared/model/pessoa';

export class EventoPessoa {
    id?: number;

    pessoa!: Pessoa;

    status?: any; // StatusEnum
    // Deve refletir o backend: campo "nomeMagicNumber" (ex.: Maria_A1B2C3D4)
    nomeMagicNumber?: string;
    // Somente leitura: indica se a pessoa já possui uma escolha ATIVA neste evento
    jaEscolheu?: boolean;

    version?: number
}
