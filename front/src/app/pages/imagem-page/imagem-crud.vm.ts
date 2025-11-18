import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Imagem } from '@/shared/model/imagem';
import { ImagemFilter } from '@/shared/model/filter/imagem-filter';
import { ImagemService } from '@/services/imagem.service';

@Injectable()
export class ImagemCrudVM extends AbstractCrud<Imagem, ImagemFilter> {
  constructor(
    port: ImagemService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(port, route, router);
    this.model = this.newModel();
    this.filter = this.newFilter();
  }

  protected newModel(): Imagem {
    return {
      id: undefined,
      nome: '',
      caminho: undefined as any,
      version: undefined
    } as unknown as Imagem;
  }

  protected newFilter(): ImagemFilter {
    return new ImagemFilter({ page: 0, size: 10, sort: 'id', direction: 'ASC' } as any);
  }

  override canDoSave(): boolean {
    const ok = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
    this.errorsVisible = !ok;
    this.errorMessages = ok ? [] : ['Informe o nome da imagem.'];
    return ok;
  }
}
