import {Directive, Input, OnInit} from '@angular/core';
import {TableLazyLoadEvent} from 'primeng/table';
import {ConfirmationService, MessageService} from 'primeng/api';
import {BaseCrudService} from '../../services/base-crud.service';
import {BaseFilter} from '../../model/filter/base-filter';

@Directive()
// MODIFICADO: A classe não é mais abstrata
export class CrudBaseComponent<T extends { id?: any; version?: number }, F extends BaseFilter> implements OnInit {

    protected selectedItemsInternal: T[] = [];

    @Input()
    dataSource: T[] = [];

    @Input()
    model!: T;

    @Input()
    filter!: F;

    displayDialog = false;
    loading = false;
    totalRecords = 0;

    protected constructor(
        protected service: BaseCrudService<T, F>,
        protected messageService: MessageService,
        protected confirmationService: ConfirmationService
    ) {
    }

    get selectedItems(): T[] {
        return this.selectedItemsInternal;
    }

    set selectedItems(v: T[]) {
        this.selectedItemsInternal = v;
    }


    ngOnInit(): void {
        this.limpar();
    }

    limpar() {
        this.newModel()
        this.newFilter();
        this.carregarDataSource();
    }


    newModelIfNull() {
        if (!this.model) {
            this.newModel();
        }
    }

    newModel() {
        const ctor = (this as any)['modelConstructor'];
        if (ctor) {
            try {
                this.model = new ctor();
                return;
            } catch (e) {
                // fallback seguro caso a instanciação via decorator falhe por algum motivo
                // Fallback para compatibilidade: usa buildDefaultFilter se o decorator não estiver disponível
                this.model = this.buildDefaultModel();
            }
        }
    }


    newFilterIfNull() {
        if (!this.filter) {
            this.newFilter();
        }
    }

    newFilter() {
        const ctor = (this as any)['filterConstructor'];
        if (ctor) {
            try {
                this.filter = new ctor();
                return;
            } catch (e) {
                // fallback seguro caso a instanciação via decorator falhe por algum motivo
                // Fallback para compatibilidade: usa buildDefaultFilter se o decorator não estiver disponível
                this.filter = this.buildDefaultFilter();
            }
        }
    }

    // Listagem
    carregarDataSource(event?: TableLazyLoadEvent) {
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
                this.dataSource = response.content;
                this.totalRecords = response.totalElements;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Erro ao carregar informações`
                });
                this.loading = false;
            }
        });
    }

    // Filtro
    filtrar() {
        (this.filter as any).page = 0;
        this.carregarDataSource();
    }

    editarModel(item: T) {
        this.model = {...(item as any)};
        this.displayDialog = true;
    }

    salvarModel() {
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
        const operacao = id ? this.service.atualizar(id, this.model) : this.service.criar(this.model);

        operacao.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Dados atualizados com sucesso`
                });
                this.displayDialog = false;
                this.carregarDataSource();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Erro ao salvar informações`
                });
            }
        });
    }

    confirmarExclusao(item: T) {
        this.confirmationService.confirm({
            message: 'Deseja realmente excluir esta informações?',
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
                            detail: `Dados excluídos com sucesso`
                        });
                        this.carregarDataSource();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao excluir informações`
                        });
                    }
                });
            }
        });
    }

    confirmarExclusaoEmLote() {
        const count = this.selectedItemsInternal.length;
        this.confirmationService.confirm({
            message: 'Deseja realmente excluir os dados selecionado(s)?',
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
                            detail: `Dados excluído(s) com sucesso`
                        });
                        this.selectedItemsInternal = [];
                        this.carregarDataSource();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao excluir informações`
                        });
                    }
                });
            }
        });
    }

    // Métodos auxiliares para o template
    getDialogHeader(): string {
        const id = (this.model as any)?.id;
        return id ? `Editar dados existentes` : `Novo registro de dados`;
    }

    // ### MÉTODOS COM IMPLEMENTAÇÃO PADRÃO ###
    // Agora você pode sobrescrevê-los na classe filha apenas quando necessário.

    // MODIFICADO: Assume que o formulário é válido por padrão.
    protected isFormularioValido(): boolean {
        return true;
    }

    // MODIFICADO: Retorna um filtro vazio.
    protected buildDefaultModel(): T {
        return {} as T;
    }
    protected buildDefaultFilter(): F {
        return {} as F;
    }


}
