import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { ClienteService } from '@/services/cliente.service';
import { Cliente } from '@/shared/model/cliente';
import { ClienteFilter } from '@/shared/model/filter/cliente-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';

import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import {
  ErmColumnComponent,
  ErmDataGridComponent,
  ErmEditingComponent,
  ErmFormComponent,
  ErmItemComponent,
  ErmPopupComponent,
  ErmTemplateDirective,
  ErmValidationRuleComponent
} from '@/shared/components/erm-data-grid';
import { SelectModule } from 'primeng/select';
import { UsuarioService } from '@/services/usuario.service';

@Component({
  selector: 'cliente-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    CrudFilterComponent,
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmPopupComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmColumnComponent,
    ErmValidationRuleComponent,
    ErmTemplateDirective,
    SelectModule
  ],
  templateUrl: './cliente-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService]
})
export class ClientePageComponent extends CrudBaseComponent<Cliente, ClienteFilter> {

  usuariosOptions: { label: string; value: number }[] = [];

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
    { key: 'email', label: 'E-mail', type: 'text', placeholder: 'Filtrar por e-mail' },
    { key: 'telefone', label: 'Telefone', type: 'text', placeholder: 'Filtrar por telefone' }
  ];

  constructor(
    service: ClienteService,
    messageService: MessageService,
    private usuarioService: UsuarioService
  ) {
    super(service, messageService, null as any);
  }

  override ngOnInit(): void {
    super.ngOnInit?.();
    // Carrega usuários para o select-box
    this.usuarioService.listar({ page: 0, size: 1000, sort: 'id', direction: 'ASC', papel: 'Cliente' } as any).subscribe({
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

  override criarInstancia(): Cliente {
    return { nome: '', email: '', telefone: '' } as Cliente;
  }

  override isFormularioValido(): boolean {
    return !!(this.model?.nome?.trim());
  }

  override getEntityLabelSingular(): string { return 'Cliente'; }
  override getEntityLabelPlural(): string { return 'Clientes'; }

  override buildDefaultFilter(): ClienteFilter {
    return { page: 0, size: 10, sort: 'id', direction: 'ASC' } as ClienteFilter;
  }

  override getDeleteConfirmMessage(item: Cliente): string {
    return `Deseja realmente excluir o cliente "${item.nome}"?`;
  }
  override getBatchDeleteConfirmMessage(count: number): string {
    return `Deseja realmente excluir ${count} cliente(s) selecionado(s)?`;
  }
  override getTableColumnCount(): number { return 4; }

  onSavingItem(event: any) {
    const data: Cliente = event.data as Cliente;
    const id = (data as any).id;
    const op$ = id ? this.service.atualizar(id, data) : this.service.criar(data);
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso` });
        this.carregar();
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar cliente';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  onDeletingItem(event: any) {
    const id = (event?.data as any)?.id;
    if (!id) return;
    this.service.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} excluído com sucesso` });
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cliente' })
    });
  }
}
