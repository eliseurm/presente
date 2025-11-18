import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Cliente } from '@/shared/model/cliente';
import { ClienteFilter } from '@/shared/model/filter/cliente-filter';
import { ClienteService } from '@/services/cliente.service';

@Injectable()
export class ClienteCrudVM extends AbstractCrud<Cliente, ClienteFilter> {
  constructor(
    port: ClienteService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(port, route, router);
    this.model = this.newModel();
    this.filter = this.newFilter();
  }

  protected newModel(): Cliente {
    return {
      id: undefined,
      nome: '',
      email: '',
      telefone: '',
      usuario: undefined as any,
      anotacoes: '',
      version: undefined,
    } as unknown as Cliente;
  }

  protected newFilter(): ClienteFilter {
    return new ClienteFilter({ page: 0, size: 10, sort: 'id', direction: 'ASC' } as any);
  }

  override canDoSave(): boolean {
    const ok = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
    this.errorsVisible = !ok;
    this.errorMessages = ok ? [] : ['Informe o nome do cliente.'];
    return ok;
  }

  override doSave() {
    const payload: any = { ...this.model } as any;
    const u = (this.model as any)?.usuario;
    if (u) {
      const id = typeof u === 'object' ? u.id : u;
      payload.usuario = id ? { id } : null;
    }
    this.model = payload;
    return super.doSave();
  }
}
