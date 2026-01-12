import { BaseFilter } from '../core/base-filter';

export class ClienteFilter extends BaseFilter {
  nome?: string;
  email?: string;
  telefone?: string;
  usuarioId?: number;

  constructor(init?: Partial<ClienteFilter>) {
    super();
    Object.assign(this, init);
  }
}
