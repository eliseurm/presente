import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { PessoaService } from '@/services/pessoa.service';
import { Pessoa } from '@/shared/model/pessoa';
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';

import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import { CrudComponent } from '@/shared/crud/crud.component';
import { TableModule } from 'primeng/table';
import { PessoaCrudVM } from './pessoa-crud.vm';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'pessoa-page',
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
    templateUrl: './pessoa-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './pessoa-page.component.scss'
    ],
    providers: [MessageService, PessoaCrudVM]
})
@CrudMetadata("PessoaPageComponent", [Pessoa, PessoaFilter])
export class PessoaPageComponent  {

    @ViewChild('crudRef') crudRef?: CrudComponent<Pessoa, PessoaFilter>;

    readonly statusOptions = [
        { label: 'Ativo', value: 'ATIVO' },
        { label: 'Inativo', value: 'INATIVO' }
    ];

    readonly filterFields: FilterField[] = [
        { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
        { key: 'email', label: 'E-mail', type: 'text', placeholder: 'Filtrar por e-mail' },
        { key: 'telefone', label: 'Telefone', type: 'text', placeholder: 'Filtrar por telefone' },
        { key: 'status', label: 'Status', type: 'select', placeholder: 'Selecione o status', options: [
                { label: 'Ativo', value: 'ATIVO' },
                { label: 'Inativo', value: 'INATIVO' }
            ] }
    ];

    constructor(
        public vm: PessoaCrudVM,
        private pessoaService: PessoaService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void { this.vm.init(); }

    onPage(event: any) {
        this.vm.filter.page = event.page;
        this.vm.filter.size = event.rows;
        this.vm.doFilter().subscribe();
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
        this.vm.doFilter().subscribe();
    }

    onDeleteRow(row: Pessoa) {
        const id = (row as any)?.id;
        if (!id) return;
        this.pessoaService.deletar(id).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Excluída com sucesso` }); this.vm.doFilter().subscribe(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir pessoa' })
        });
    }

    onCloseCrud() { this.router.navigate(['/']); }
}
