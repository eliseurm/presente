import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {CardModule} from 'primeng/card';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {TooltipModule} from 'primeng/tooltip';

import {CrudBaseComponent} from '@/shared/components/crud-base/crud-base.component';
import {PessoaService} from '@/services/pessoa.service';
import {Pessoa} from '@/shared/model/pessoa';
import {PessoaFilter} from '@/shared/model/filter/pessoa-filter';
import {Select} from "primeng/select";
import {Tag} from "primeng/tag";
import {FilterField} from "@/shared/components/crud-filter/filter-field";

@Component({
    selector: 'pessoa-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        Select,
        Tag
    ],
    templateUrl: './pessoa-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './pessoa-page.component.scss'
    ],
    providers: [MessageService, ConfirmationService]
})
export class PessoaPageComponent extends CrudBaseComponent<Pessoa, PessoaFilter> {
    statusOptions = [
        { label: 'Ativo', value: 'ATIVO' },
        { label: 'Inativo', value: 'INATIVO' }
    ];

    constructor(
        pessoaService: PessoaService,
        messageService: MessageService,
        confirmationService: ConfirmationService
    ) {
        super(pessoaService, messageService, confirmationService);
    }

    protected getFilterFields(): FilterField[] {
        return [
            {
                key: 'nome',
                label: 'Nome',
                type: 'text',
                placeholder: 'Filtrar por nome'
            },
            {
                key: 'email',
                label: 'E-mail',
                type: 'text',
                placeholder: 'Filtrar por e-mail'
            },
            {
                key: 'telefone',
                label: 'Telefone',
                type: 'text',
                placeholder: 'Filtrar por telefone'
            },
            {
                key: 'status',
                label: 'Status',
                type: 'select',
                placeholder: 'Selecione o status',
                options: this.statusOptions
            }
        ];
    }

    protected criarInstancia(): Pessoa {
        return {
            nome: '',
            email: '',
            telefone: '',
            status: 'ATIVO'
        };
    }

    protected isFormularioValido(): boolean {
        return !!(
            this.currentItem.nome?.trim() &&
            this.currentItem.email?.trim()
        );
    }

    protected getEntityLabelSingular(): string {
        return 'Pessoa';
    }

    protected getEntityLabelPlural(): string {
        return 'Pessoas';
    }

    protected buildDefaultFilter(): PessoaFilter {
        return {
            page: 0,
            size: 10,
            sort: 'id',
            direction: 'ASC'
        };
    }

    protected getDeleteConfirmMessage(item: Pessoa): string {
        return `Deseja realmente excluir a pessoa "${item.nome}"?`;
    }

    protected getBatchDeleteConfirmMessage(count: number): string {
        return `Deseja realmente excluir ${count} pessoa(s) selecionada(s)?`;
    }

    protected getTableColumnCount(): number {
        return 4; // Nome, E-mail, Telefone, Status
    }

    getStatusLabel(status: string): string {
        const option = this.statusOptions.find(opt => opt.value === status);
        return option?.label || status;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
        const severities: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
            'INVITED': 'info',
            'ACTIVE': 'success',
            'COMPLETED': 'warning'
        };
        return severities[status] || 'info';
    }
}
