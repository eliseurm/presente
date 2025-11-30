import {Pessoa} from '@/shared/model/pessoa';

export class EventoPessoa {
    id?: number;
    pessoa!: Pessoa | { id: number };
    status?: any; // StatusEnum
    numeroMagico?: string;
}
