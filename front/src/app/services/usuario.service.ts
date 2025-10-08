import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Usuario } from '@/shared/model/usuario';
import { UsuarioFilter } from '@/shared/model/filter/usuario-filter';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseCrudService<Usuario, UsuarioFilter> {
  protected apiUrl = '/api/usuario';

  constructor(http: HttpClient) {
    super(http);
  }
}
