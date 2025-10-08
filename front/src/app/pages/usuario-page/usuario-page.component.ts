import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { UsuarioService } from '@/services/usuario.service';
import { Usuario } from '@/shared/model/usuario';
import { UsuarioFilter } from '@/shared/model/filter/usuario-filter';
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
import { EnumSelectComponent } from '@/shared/components/enum-select/enum-select.component';
import { PapelEnum } from '@/shared/model/enum/papel.enum';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";

@Component({
  selector: 'usuario-page',
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
    EnumSelectComponent
  ],
  templateUrl: './usuario-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService]
})
export class UsuarioPageComponent extends CrudBaseComponent<Usuario, UsuarioFilter> {

  // Expor enums para o template
  papelEnumType: any = PapelEnum;
  statusEnumType: any = StatusEnum;

  // Usar opções compatíveis com backend (usa toString no enum -> nomes em Português)
  // readonly papelOptions = [
  //   { label: 'Administrador', value: 'Administrador' },
  //   { label: 'Cliente', value: 'Cliente' },
  //   { label: 'Usuário', value: 'Usuário' }
  // ];
  // readonly statusOptions = [
  //   { label: 'Ativo', value: 'Ativo' },
  //   { label: 'Pausado', value: 'Pausado' },
  //   { label: 'Encerrado', value: 'Encerrado' }
  // ];

  readonly filterFields: FilterField[] = [
    { key: 'username', label: 'Usuário', type: 'text', placeholder: 'Filtrar por usuário' },
    { key: 'papel', label: 'Papel', type: 'enum', placeholder: 'Selecione o papel', enumObject: PapelEnum, optionLabel: 'descricao' },
    { key: 'status', label: 'Status', type: 'enum', placeholder: 'Selecione o status', enumObject: StatusEnum, optionLabel: 'descricao' }
  ];


    constructor(
    service: UsuarioService,
    messageService: MessageService
  ) {
    super(service, messageService, null as any);
  }

  override criarInstancia(): Usuario {
    return { username: '', papel: this.papelEnumType.USUARIO, status: this.statusEnumType.ATIVO } as unknown as Usuario;
  }

  override isFormularioValido(): boolean {
    return !!(this.model?.username?.trim());
  }

  override getEntityLabelSingular(): string { return 'Usuário'; }
  override getEntityLabelPlural(): string { return 'Usuários'; }

  override buildDefaultFilter(): UsuarioFilter {
    return { page: 0, size: 10, sort: 'id', direction: 'ASC' } as UsuarioFilter;
  }

  override getDeleteConfirmMessage(item: Usuario): string {
    return `Deseja realmente excluir o usuário "${item.username}"?`;
  }
  override getBatchDeleteConfirmMessage(count: number): string {
    return `Deseja realmente excluir ${count} usuário(s) selecionado(s)?`;
  }
  override getTableColumnCount(): number { return 4; }

  // Normaliza os dados carregados para que os campos de enum fiquem compatíveis com o editor
  override carregar(): void {
    this.loading = true;
    this.service.listar(this.filter).subscribe({
      next: (response: any) => {
        const content = response?.content || [];
        const papelValues = Object.values(PapelEnum) as any[];
        const statusValues = Object.values(StatusEnum) as any[];
        this._dataSource = content.map((item: any) => {
          const novo: any = { ...item };
          // Mapear papel/status strings -> objetos do enum
          if (novo?.papel && typeof novo.papel === 'string') {
            const str = novo.papel as string;
            // Tenta por key exata
            let found = (PapelEnum as any)[str];
            if (!found) {
              const alvo = str.toLowerCase();
              // Tenta por descricao (case-insensitive)
              found = papelValues.find(v => (v.descricao || '').toLowerCase() === alvo);
            }
            novo.papel = found || { key: str, descricao: str };
          }
          if (novo?.status && typeof novo.status === 'string') {
            const str = novo.status as string;
            let found = (StatusEnum as any)[str];
            if (!found) {
              const alvo = str.toLowerCase();
              found = statusValues.find(v => (v.descricao || '').toLowerCase() === alvo);
            }
            novo.status = found || { key: str, descricao: str };
          }
          return novo;
        });
        this.totalRecords = response?.totalElements ?? content.length;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao carregar ${this.getEntityLabelPlural().toLowerCase()}` });
        this.loading = false;
      }
    });
  }

  onSavingItem(event: any) {
    const data: any = event.data as any;

    const id = data?.id;

    // Normaliza enums para enviar os valores esperados pelo backend (usa toString -> nomes PT-BR)
    const papelVal = data?.papel;
    const statusVal = data?.status;

    const papelDesc = typeof papelVal === 'object' && papelVal ? (papelVal.descricao || papelVal.key || papelVal) : papelVal;
    const statusDesc = typeof statusVal === 'object' && statusVal ? (statusVal.descricao || statusVal.key || statusVal) : statusVal;

    const payload: any = {
      id,
      username: data?.username,
      senha: data?.senha,
      papel: papelDesc || undefined,
      status: statusDesc || undefined
    };

    const op$ = id ? this.service.atualizar(id, payload) : this.service.criar(payload);
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso` });
        this.carregar();
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar usuário';
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
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir usuário' })
    });
  }

    protected readonly tipoProdutoEnumType = ProdutoTipoEnum;
}
