import { BaseFilter } from '@/shared/model/filter/base-filter';

export interface ProdutoFilter extends BaseFilter {
  nome?: string;
}
