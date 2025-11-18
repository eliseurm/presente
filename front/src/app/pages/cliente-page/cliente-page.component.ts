import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { ClienteService } from '@/services/cliente.service';
import { Cliente } from '@/shared/model/cliente';
import { ClienteFilter } from '@/shared/model/filter/cliente-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';

import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import { SelectModule } from 'primeng/select';
import { UsuarioService } from '@/services/usuario.service';
import { UsuarioFilter } from '@/shared/model/filter/usuario-filter';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import { CrudComponent } from '@/shared/crud/crud.component';
import { TableModule } from 'primeng/table';
import { ClienteCrudVM } from './cliente-crud.vm';

@Component({
  selector: 'cliente-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CrudFilterComponent,
    CrudComponent,
    TableModule,
    SelectModule
  ],
  templateUrl: './cliente-page.component.html',
  styleUrls: ['../../shared/components/crud-base/crud-base.component.scss'],
  providers: [MessageService, ClienteCrudVM]
})
@CrudMetadata("ClientePageComponent", [Cliente, ClienteFilter])
export class ClientePageComponent  {

  @ViewChild('crudRef') crudRef?: CrudComponent<Cliente, ClienteFilter>;

  usuariosOptions: { label: string; value: number }[] = [];

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
    { key: 'email', label: 'E-mail', type: 'text', placeholder: 'Filtrar por e-mail' },
    { key: 'telefone', label: 'Telefone', type: 'text', placeholder: 'Filtrar por telefone' }
  ];

  constructor(
    public vm: ClienteCrudVM,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vm.init();
    // Carrega usuários para o select-box
    const filtroUsuarios = new UsuarioFilter({ page: 0, size: 1000, sort: 'id', direction: 'ASC', papel: 'CLIENTE' });
    this.usuarioService.listar(filtroUsuarios).subscribe({
      next: (resp: any) => {
        const content = resp?.content || [];
        this.usuariosOptions = content.map((u: any) => ({ label: u.username, value: u.id }));
      },
      error: () => {
        // Em caso de erro, mantém lista vazia
        this.usuariosOptions = [];
      }
    });
  }

  onPage(event: any) {
    this.vm.filter.page = event.page;
    this.vm.filter.size = event.rows;
    this.vm.doFilter().subscribe();
  }

  onClearFilters() {
    this.vm.filter = this.vm['newFilter']();
    this.vm.doFilter().subscribe();
  }

  onDeleteRow(row: any) {
    const id = row?.id;
    if (!id) return;
    this.clienteService.deletar(id).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Excluído com sucesso' }); this.vm.doFilter().subscribe(); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cliente' })
    });
  }

  // Evita erro de template TS2339 ao acessar .id quando o modelo pode ser number | object
  getUsuarioIdFromModel(): number | null {
    try {
      const u: any = (this.vm as any)?.model?.['usuario'];
      if (!u) return null;
      if (typeof u === 'number') return u;
      if (typeof u === 'object') return u.id ?? null;
      return null;
    } catch {
      return null;
    }
  }

  onCloseCrud() { this.router.navigate(['/']); }
}
