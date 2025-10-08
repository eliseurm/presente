import { BaseFilter } from './base-filter';

export interface ClienteFilter extends BaseFilter {
  nome?: string;
  email?: string;
  telefone?: string;
  usuarioId?: number;
}
