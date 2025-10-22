import { Cliente } from '@/shared/model/cliente';
import { EventoPessoa } from '@/shared/model/evento-pessoa';
import { EventoProduto } from '@/shared/model/evento-produto';

export class Evento {
  id?: number;
  nome?: string;
  descricao?: string;
  cliente?: Cliente | { id: number };
  status?: any; // StatusEnum (usar objeto enum como nas outras telas)
  anotacoes?: string;
  inicio?: string | Date;
  fimPrevisto?: string | Date;
  fim?: string | Date;

  pessoas?: EventoPessoa[];
  produtos?: EventoProduto[];
}
