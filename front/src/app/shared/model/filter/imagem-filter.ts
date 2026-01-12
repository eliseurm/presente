import { BaseFilter } from '@/shared/model/core/base-filter';

export class ImagemFilter extends BaseFilter {
  nome?: string;

  constructor(init?: Partial<ImagemFilter>) {
    super();
    Object.assign(this, init);
  }
}
