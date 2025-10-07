import { Directive, OnInit } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BaseCrudService } from '../../services/base-crud.service';
import { BaseFilter } from '../../model/filter/base-filter';

@Directive()
// MODIFICADO: A classe não é mais abstrata
export class CrudBaseComponent<T, F extends BaseFilter> implements OnInit {
    // ... (propriedades existentes não foram alteradas) ...
    protected _dataSource: T[] = [];
    protected selectedItemsInternal: T[] = [];
    protected _model!: T;
    filter!: F;

    displayDialog = false;
    loading = false;
    totalRecords = 0;

    protected constructor(
        protected service: BaseCrudService<T, F>,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService
    ) {}

    get dataSource(): T[] { return this._dataSource; }
    set dataSource(v: T[]) { this._dataSource = v; }

    get selectedItems(): T[] { return this.selectedItemsInternal; }
    set selectedItems(v: T[]) { this.selectedItemsInternal = v; }

    get model(): T { return this._model; }
    set model(v: T) { this._model = v; }


    // ... (métodos como ngOnInit, carregar, salvar, etc., continuam os mesmos) ...
    ngOnInit(): void {
        this.filter = this.buildDefaultFilter();
        this._model = this.criarInstancia();
        this.carregar();
    }

    // Listagem
    carregar(event?: TableLazyLoadEvent) {
        this.loading = true;

        if (event) {
            if (event.first != null && event.rows != null) {
                (this.filter as any).page = Math.floor(event.first / event.rows);
                (this.filter as any).size = event.rows;
            }
            if (event.sortField) {
                (this.filter as any).sort = event.sortField as string;
                (this.filter as any).direction = event.sortOrder === 1 ? 'ASC' : 'DESC';
            }
        }

        this.service.listar(this.filter).subscribe({
            next: (response: any) => {
                this._dataSource = response.content;
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
        (this.filter as any).page = 0;
        this.carregar();
    }

    limpar() {
        this.filter = this.buildDefaultFilter();
        this.carregar();
    }

    // Formulário
    novo() {
        this._model = this.criarInstancia();
        this.displayDialog = true;
    }

    editar(item: T) {
        this._model = { ...(item as any) };
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
        const id = (this._model as any).id as number | undefined;
        const operacao = id
            ? this.service.atualizar(id, this._model)
            : this.service.criar(this._model);

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
        const id = (this._model as any)?.id;
        return id
            ? `Editar ${this.getEntityLabelSingular()}`
            : `Nova ${this.getEntityLabelSingular()}`;
    }

    getColumnCount(): number {
        return this.getTableColumnCount() + 2; // +2 para checkbox e ações
    }

    // ### MÉTODOS COM IMPLEMENTAÇÃO PADRÃO ###
    // Agora você pode sobrescrevê-los na classe filha apenas quando necessário.

    // MODIFICADO: Retorna um objeto vazio. Ideal para formulários simples.
    protected criarInstancia(): T {
        return {} as T;
    }

    // MODIFICADO: Assume que o formulário é válido por padrão.
    protected isFormularioValido(): boolean {
        return true;
    }

    // MODIFICADO: Retorna um nome genérico.
    protected getEntityLabelSingular(): string {
        return 'Registro';
    }

    // MODIFICADO: Retorna um nome genérico no plural.
    protected getEntityLabelPlural(): string {
        return 'Registros';
    }

    // MODIFICADO: Retorna um filtro vazio.
    protected buildDefaultFilter(): F {
        return {} as F;
    }



    // MODIFICADO: Gera uma mensagem de exclusão padrão.
    protected getDeleteConfirmMessage(item: T): string {
        return `Deseja realmente excluir este ${this.getEntityLabelSingular().toLowerCase()}?`;
    }

    // MODIFICADO: Gera uma mensagem de exclusão em lote padrão.
    protected getBatchDeleteConfirmMessage(count: number): string {
        const label = count > 1 ? this.getEntityLabelPlural() : this.getEntityLabelSingular();
        return `Deseja realmente excluir ${count} ${label.toLowerCase()} selecionado(s)?`;
    }

    // MODIFICADO: Retorna 0 por padrão. Sobrescreva para definir o colspan correto na tabela.
    protected getTableColumnCount(): number {
        return 0;
    }
}
