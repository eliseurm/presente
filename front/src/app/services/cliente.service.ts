import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '@/shared/services/base-crud.service';
import { Cliente } from '@/shared/model/cliente';
import { ClienteFilter } from '@/shared/model/filter/cliente-filter';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClienteService extends BaseCrudService<Cliente, ClienteFilter> {
  protected apiUrl = '/api/cliente';

  constructor(http: HttpClient) {
    super(http);
  }

  // Retorna apenas os clientes vinculados ao usuário autenticado
  getMe(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/me`);
  }
}
