
// src/app/shared/components/base-crud.component.ts
import { Directive, OnInit } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BaseCrudService } from '../services/base-crud.service';
import { BaseFilter } from '../model/filter/base-filter';

@Directive()
export abstract class BaseCrudComponent<T, F extends BaseFilter> implements OnInit {
    // Dados e estados comuns
    protected itemsInternal: T[] = [];
    protected selectedItemsInternal: T[] = [];
    protected currentItemInternal!: T;

    displayDialog = false;
    loading = false;
    totalRecords = 0;
    filtro!: F;

    protected constructor(
        protected service: BaseCrudService<T, F>,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService
    ) {}

    // Aliases públicos para facilitar mapeamento nos componentes filhos
    get items(): T[] { return this.itemsInternal; }
    set items(v: T[]) { this.itemsInternal = v; }

    get selectedItems(): T[] { return this.selectedItemsInternal; }
    set selectedItems(v: T[]) { this.selectedItemsInternal = v; }

    get currentItem(): T { return this.currentItemInternal; }
    set currentItem(v: T) { this.currentItemInternal = v; }

    ngOnInit(): void {
        this.filtro = this.buildDefaultFilter();
        this.currentItemInternal = this.criarInstancia();
        this.carregar();
    }

    // Listagem
    carregar(event?: TableLazyLoadEvent) {
        this.loading = true;

        if (event) {
            if (event.first != null && event.rows != null) {
                (this.filtro as any).page = Math.floor(event.first / event.rows);
                (this.filtro as any).size = event.rows;
            }
            if (event.sortField) {
                (this.filtro as any).sort = event.sortField as string;
                (this.filtro as any).direction = event.sortOrder === 1 ? 'ASC' : 'DESC';
            }
        }

        this.service.listar(this.filtro).subscribe({
            next: (response: any) => {
                this.itemsInternal = response.content;
                this.totalRecords = response.totalElements;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Erro ao carregar ${this.getEntityLabelPlural().toLowerCase()}`
                });
                this.loading = false;
            }
        });
    }

    // Filtro
    filtrar() {
        (this.filtro as any).page = 0;
        this.carregar();
    }

    limpar() {
        this.filtro = this.buildDefaultFilter();
        this.carregar();
    }

    // Formulário
    novo() {
        this.currentItemInternal = this.criarInstancia();
        this.displayDialog = true;
    }

    editar(item: T) {
        this.currentItemInternal = { ...(item as any) };
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

        // @ts-ignore: id opcional
        const id = (this.currentItemInternal as any).id as number | undefined;
        const operacao = id
            ? this.service.atualizar(id, this.currentItemInternal)
            : this.service.criar(this.currentItemInternal);

        operacao.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado(a)' : 'criado(a)'} com sucesso`
                });
                this.displayDialog = false;
                this.carregar();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Erro ao salvar ${this.getEntityLabelSingular().toLowerCase()}`
                });
            }
        });
    }

    confirmarExclusao(item: T) {
        this.confirmationService.confirm({
            message: this.getDeleteConfirmMessage(item),
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                // @ts-ignore: id opcional
                const id = (item as any).id as number;
                this.service.deletar(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${this.getEntityLabelSingular()} excluído(a) com sucesso`
                        });
                        this.carregar();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}`
                        });
                    }
                });
            }
        });
    }

    confirmarExclusaoEmLote() {
        const count = this.selectedItemsInternal.length;
        this.confirmationService.confirm({
            message: this.getBatchDeleteConfirmMessage(count),
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                // @ts-ignore: id opcional
                const ids = this.selectedItemsInternal.map((p: any) => p.id as number);
                this.service.deletarEmLote(ids).subscribe({
                    next: (response: any) => {
                        const deletados = response?.deletados ?? count;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${deletados} ${this.getEntityLabelPlural().toLowerCase()} excluído(s) com sucesso`
                        });
                        this.selectedItemsInternal = [];
                        this.carregar();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao excluir ${this.getEntityLabelPlural().toLowerCase()}`
                        });
                    }
                });
            }
        });
    }

    // Métodos auxiliares para o template
    getDialogHeader(): string {
        const id = (this.currentItemInternal as any)?.id;
        return id
            ? `Editar ${this.getEntityLabelSingular()}`
            : `Nova ${this.getEntityLabelSingular()}`;
    }

    // Este método deve retornar o número total de colunas (incluindo seleção e ações)
    getColumnCount(): number {
        return this.getTableColumnCount() + 2; // +2 para checkbox e ações
    }

    // Métodos que cada CRUD deve implementar
    protected abstract criarInstancia(): T;
    protected abstract isFormularioValido(): boolean;
    protected abstract getEntityLabelSingular(): string;
    protected abstract getEntityLabelPlural(): string;
    protected abstract buildDefaultFilter(): F;
    protected abstract getDeleteConfirmMessage(item: T): string;
    protected abstract getBatchDeleteConfirmMessage(count: number): string;
    protected abstract getTableColumnCount(): number; // Número de colunas específicas da entidade
}
