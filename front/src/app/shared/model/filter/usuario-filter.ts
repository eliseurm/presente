import { BaseFilter } from './base-filter';

export interface UsuarioFilter extends BaseFilter {
  username?: string;
  papel?: string;
  status?: string;
}
