import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { UsuarioService } from '@/services/usuario.service';
import { Usuario } from '@/shared/model/usuario';
import { UsuarioFilter } from '@/shared/model/filter/usuario-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import { EnumSelectComponent } from '@/shared/components/enum-select/enum-select.component';
import { PapelEnum } from '@/shared/model/enum/papel.enum';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { CrudMetadata } from '@/shared/core/crud.metadata.decorator';
import { CrudComponent } from '@/shared/crud/crud.component';
import { TableModule } from 'primeng/table';
import { ErmDataGridComponent, ErmColumnComponent, ErmTemplateDirective } from '@/shared/components/erm-data-grid';
import { UsuarioCrudVM } from './usuario-crud.vm';

@Component({
  selector: 'usuario-page',
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
    EnumSelectComponent,
    ErmDataGridComponent,
    ErmColumnComponent,
    ErmTemplateDirective
  ],
  templateUrl: './usuario-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService, UsuarioCrudVM]
})
@CrudMetadata('UsuarioPageComponent', [Usuario, UsuarioFilter])
export class UsuarioPageComponent {
  @ViewChild('crudRef') crudRef?: CrudComponent<Usuario, UsuarioFilter>;

  papelEnumType: any = PapelEnum;
  statusEnumType: any = StatusEnum;

  readonly filterFields: FilterField[] = [
    { key: 'username', label: 'Usuário', type: 'text', placeholder: 'Filtrar por usuário' },
    { key: 'papel', label: 'Papel', type: 'enum', placeholder: 'Selecione o papel', enumObject: PapelEnum, optionLabel: 'descricao' },
    { key: 'status', label: 'Status', type: 'enum', placeholder: 'Selecione o status', enumObject: StatusEnum, optionLabel: 'descricao' }
  ];

  constructor(
    public vm: UsuarioCrudVM,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void { this.vm.init(); }

  onLazyLoad(event: any) {
    const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
    const size = event.rows || this.vm.filter.size || 10;
    this.vm.filter.page = page;
    this.vm.filter.size = size;
    if (Array.isArray(event.multiSortMeta) && event.multiSortMeta.length) {
      this.vm.filter.sorts = event.multiSortMeta.map((m: any) => ({ field: m.field, direction: m.order === 1 ? 'ASC' : 'DESC' }));
    } else if (event.sortField) {
      this.vm.filter.sorts = [{ field: event.sortField, direction: (event.sortOrder === 1 ? 'ASC' : 'DESC') }];
    }
    this.vm.doFilter().subscribe();
  }

  onClearFilters() {
    this.vm.filter = this.vm['newFilter']();
    this.vm.doFilter().subscribe();
  }

  onDeleteRow(row: any) {
    const id = row?.id;
    if (!id) return;
    this.usuarioService.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Excluído com sucesso' });
        this.vm.doFilter().subscribe();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir usuário' })
    });
  }

  onCloseCrud() { this.router.navigate(['/']); }
}
