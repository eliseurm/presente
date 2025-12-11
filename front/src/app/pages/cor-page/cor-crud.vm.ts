import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Cor } from '@/shared/model/cor';
import { CorFilter } from '@/shared/model/filter/cor-filter';
import { CorService } from '@/services/cor.service';
import { Observable } from 'rxjs';

@Injectable()
export class CorCrudVM extends AbstractCrud<Cor, CorFilter> {
  constructor(
    port: CorService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(port, route, router);
    this.model = this.newModel();
    this.filter = this.newFilter();
  }

  protected newModel(): Cor {
    return {
      id: undefined,
      nome: '',
      corHex: '#000000',
      corRgbA: 'rgba(0,0,0,1)'
    } as unknown as Cor;
  }

  protected newFilter(): CorFilter {
    return new CorFilter();
  }

  override canDoSave(): boolean {
    const errors: string[] = [];
    if (!(this.model?.nome && String(this.model.nome).trim().length > 0)) {
      errors.push('Informe o nome da cor.');
    }
    if (!(this.model as any)?.corHex) {
      errors.push('Selecione a cor.');
    }
    this.errorMessages = errors;
    this.errorsVisible = errors.length > 0;
    return errors.length === 0;
  }
}
