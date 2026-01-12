import { BaseFilter } from '../core/base-filter';

export class UsuarioFilter extends BaseFilter {
  username?: string;
  papel?: string;
  status?: string;

  constructor(init?: Partial<UsuarioFilter>) {
    super();
    Object.assign(this, init);
  }
}
