import { BaseFilter } from '@/shared/model/core/base-filter';

export class ProdutoFilter extends BaseFilter {

  nome?: string;

  constructor(init?: Partial<ProdutoFilter>) {
    super();
    Object.assign(this, init);
  }
}
