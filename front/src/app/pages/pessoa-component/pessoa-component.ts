// src/app/pages/pessoa-component/pessoa-component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Imports
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Select } from 'primeng/select';

// Imports do projeto
import { PessoaService } from '@/services/pessoa.service';
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';
import {Pessoa} from "@/shared/model/pessoa";

@Component({
    selector: 'app-pessoa',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        CardModule,
        TagModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        Select
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './pessoa-component.html',
    styleUrl: './pessoa-component.scss'
})
import { BaseCrudComponent } from '@/shared/components/base-crud.component';

export class PessoaComponent extends BaseCrudComponent<Pessoa, PessoaFilter> implements OnInit {
    pessoas: Pessoa[] = [];
    pessoasSelecionadas: Pessoa[] = [];
    pessoaSelecionada: Pessoa = this.novaPessoa();
    displayDialog: boolean = false;
    loading: boolean = false;
    totalRecords: number = 0;

    filtro: PessoaFilter = {
        page: 0,
        size: 10,
        sort: 'id',
        direction: 'DESC'
    };

    statusOptions = [
        { label: 'Convidado', value: 'INVITED' },
        { label: 'Ativo', value: 'ACTIVE' },
        { label: 'Concluído', value: 'COMPLETED' }
    ];

    constructor(
        private pessoaService: PessoaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.carregarPessoas();
    }

    carregarPessoas(event?: TableLazyLoadEvent) {
        this.loading = true;

        if (event) {
            this.filtro.page = event.first! / event.rows!;
            this.filtro.size = event.rows!;

            if (event.sortField) {
                this.filtro.sort = event.sortField as string;
                this.filtro.direction = event.sortOrder === 1 ? 'ASC' : 'DESC';
            }
        }

        this.pessoaService.listar(this.filtro).subscribe({
            next: (response) => {
                this.pessoas = response.content;
                this.totalRecords = response.totalElements;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar pessoas'
                });
                this.loading = false;
            }
        });
    }

    filtrar() {
        this.filtro.page = 0;
        this.carregarPessoas();
    }

    limpar() {
        this.filtro = {
            page: 0,
            size: 10,
            sort: 'id',
            direction: 'DESC'
        };
        this.carregarPessoas();
    }

    novo() {
        this.pessoaSelecionada = this.novaPessoa();
        this.displayDialog = true;
    }

    editar(pessoa: Pessoa) {
        this.pessoaSelecionada = { ...pessoa };
        this.displayDialog = true;
    }

    salvar() {
        if (!this.isFormularioValido()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Preencha todos os campos obrigatórios'
            });
            return;
        }

        const operacao = this.pessoaSelecionada.id
            ? this.pessoaService.atualizar(this.pessoaSelecionada.id, this.pessoaSelecionada)
            : this.pessoaService.criar(this.pessoaSelecionada);

        operacao.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Pessoa ${this.pessoaSelecionada.id ? 'atualizada' : 'criada'} com sucesso`
                });
                this.displayDialog = false;
                this.carregarPessoas();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao salvar pessoa'
                });
            }
        });
    }

    confirmarExclusao(pessoa: Pessoa) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja excluir ${pessoa.nome}?`,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.pessoaService.deletar(pessoa.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Pessoa excluída com sucesso'
                        });
                        this.carregarPessoas();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao excluir pessoa'
                        });
                    }
                });
            }
        });
    }

    confirmarExclusaoEmLote() {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja excluir ${this.pessoasSelecionadas.length} pessoa(s)?`,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                const ids = this.pessoasSelecionadas.map(p => p.id!);
                this.pessoaService.deletarEmLote(ids).subscribe({
                    next: (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${response.deletados} pessoa(s) excluída(s) com sucesso`
                        });
                        this.pessoasSelecionadas = [];
                        this.carregarPessoas();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao excluir pessoas'
                        });
                    }
                });
            }
        });
    }

    isFormularioValido(): boolean {
        return !!(
            this.pessoaSelecionada.nome?.trim() &&
            this.pessoaSelecionada.email?.trim() &&
            this.pessoaSelecionada.status
        );
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

    private novaPessoa(): Pessoa {
        return {
            nome: '',
            email: '',
            telefone: '',
            status: 'INVITED'
        };
    }
}
