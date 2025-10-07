import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { PessoaService } from '@/services/pessoa.service';
import { Pessoa } from '@/shared/model/pessoa';
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';
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

@Component({
    selector: 'pessoa-page',
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
        ErmValidationRuleComponent
    ],
    templateUrl: './pessoa-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './pessoa-page.component.scss'
    ],
    providers: [MessageService]
})
export class PessoaPageComponent extends CrudBaseComponent<Pessoa, PessoaFilter> {
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
        pessoaService: PessoaService,
        messageService: MessageService
    ) {
        // ConfirmationService não é usado com o ERM Data Grid
        super(pessoaService, messageService, null as any);
    }

    override criarInstancia(): Pessoa {
        return {
            nome: '',
            email: '',
            telefone: '',
            status: 'ATIVO'
        } as Pessoa;
    }

    override isFormularioValido(): boolean {
        return !!(this.model?.nome?.trim() && this.model?.email?.trim());
    }

    override getEntityLabelSingular(): string { return 'Pessoa'; }
    override getEntityLabelPlural(): string { return 'Pessoas'; }

    override buildDefaultFilter(): PessoaFilter {
        return { page: 0, size: 10, sort: 'id', direction: 'ASC' } as PessoaFilter;
    }

    override getDeleteConfirmMessage(item: Pessoa): string {
        return `Deseja realmente excluir a pessoa "${item.nome}"?`;
    }
    override getBatchDeleteConfirmMessage(count: number): string {
        return `Deseja realmente excluir ${count} pessoa(s) selecionada(s)?`;
    }
    override getTableColumnCount(): number { return 4; }

    // Eventos do ERM Data Grid
    onInitNewRow(event: any) {
        event.data.status = 'ATIVO';
    }

    onSavingItem(event: any) {
        const data: Pessoa = event.data as Pessoa;
        if (!data?.nome?.trim() || !data?.email?.trim()) {
            return;
        }
        const id = (data as any).id;
        const op$ = id ? this.service.atualizar(id, data) : this.service.criar(data);
        op$.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizada' : 'criada'} com sucesso` });
                this.carregar();
            },
            error: (error) => {
                const detail = error?.error?.message || 'Erro ao salvar pessoa';
                this.messageService.add({ severity: 'error', summary: 'Erro', detail });
            }
        });
    }

    onDeletingItem(event: any) {
        const id = (event?.data as any)?.id;
        if (!id) return;
        this.service.deletar(id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} excluída com sucesso` });
                this.carregar();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}` });
            }
        });
    }
}
