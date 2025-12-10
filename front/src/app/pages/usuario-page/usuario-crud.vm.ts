import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Usuario } from '@/shared/model/usuario';
import { UsuarioFilter } from '@/shared/model/filter/usuario-filter';
import { UsuarioService } from '@/services/usuario.service';
import { PapelEnum } from '@/shared/model/enum/papel.enum';
import { StatusEnum } from '@/shared/model/enum/status.enum';

@Injectable()
export class UsuarioCrudVM extends AbstractCrud<Usuario, UsuarioFilter> {
  constructor(
    port: UsuarioService,
    route: ActivatedRoute,
    router: Router,
  ) {
    super(port, route, router);
    this.model = this.newModel();
    this.filter = this.newFilter();
  }

  protected newModel(): Usuario {
    return {
      id: undefined,
      username: '',
      senha: '',
      papel: (PapelEnum as any).USUARIO ?? { key: 'USUARIO', descricao: 'Usuário' },
      status: (StatusEnum as any).ATIVO ?? { key: 'ATIVO', descricao: 'Ativo' },
      version: undefined,
    } as unknown as Usuario;
  }

  protected newFilter(): UsuarioFilter {
    return new UsuarioFilter({ page: 0, size: 10, sorts: [{ field: 'id', direction: 'ASC' }] } as any);
  }

  override canDoSave(): boolean {
    const errors: string[] = [];
    if (!(this.model?.username && String(this.model.username).trim().length > 0)) errors.push('Informe o usuário.');
    this.errorMessages = errors;
    this.errorsVisible = errors.length > 0;
    return errors.length === 0;
  }

  // Normaliza enums/valores antes de salvar para o formato esperado pelo back-end
  override doSave(): import('rxjs').Observable<Usuario> {
    const payload: any = { ...this.model } as any;
    // papel/status: enviar a descrição (ou key) conforme disponível
    const papelVal: any = (this.model as any)?.papel;
    const statusVal: any = (this.model as any)?.status;
    payload.papel = typeof papelVal === 'object' && papelVal ? (papelVal.descricao || papelVal.key) : papelVal;
    payload.status = typeof statusVal === 'object' && statusVal ? (statusVal.descricao || statusVal.key) : statusVal;
    // senha: já vem em model['senha'] quando informada; mantém como está
    this.model = payload;
    return super.doSave();
  }
}
