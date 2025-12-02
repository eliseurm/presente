import {Pessoa} from '@/shared/model/pessoa';

export class EventoPessoa {
    id?: number;
    pessoa!: Pessoa | { id: number };
    status?: any; // StatusEnum
    // Deve refletir o backend: campo "nomeMagicNumber" (ex.: Maria_A1B2C3D4)
    nomeMagicNumber?: string;
}
