import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';

import {
    ErmColumnComponent,
    ErmDataGridComponent,
    ErmDataGridEvent,
    ErmEditingComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmPopupComponent,
    ErmTemplateDirective,
    ErmValidationRuleComponent
} from '../../shared/components/erm-data-grid';
import {TamanhoService} from '../../services/tamanho.service';
import {Tamanho} from '../../shared/model/tamanho';
import {ProdutoTipoEnum} from '../../shared/model/enum/produto-tipo.enum';
import {CrudBaseComponent} from "@/shared/components/crud-base/crud-base.component";
import {TamanhoFilter} from "@/shared/model/filter/tamanho-filter";
import {CrudFilterComponent} from "@/shared/components/crud-filter/crud-filter.component";
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";
import {FilterField} from "@/shared/components/crud-filter/filter-field";

@Component({
    selector: 'app-tamanho-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        ErmDataGridComponent,
        ErmColumnComponent,
        ErmEditingComponent,
        ErmFormComponent,
        ErmItemComponent,
        ErmPopupComponent,
        ErmValidationRuleComponent,
        CrudFilterComponent,
        ErmTemplateDirective,
        EnumSelectComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './tamanho-page.component.html',
    styleUrls: ['./tamanho-page.component.scss']
})
export class TamanhoPageComponent extends CrudBaseComponent<Tamanho, TamanhoFilter> {

    tipoProdutoEnumType: any = ProdutoTipoEnum;

    // Definição dos campos de filtro
    readonly filterFields: FilterField[] = [
        {
            key: 'tipo',
            label: 'Tipo de Produto',
            type: 'enum',
            placeholder: 'Selecione o tipo',
            enumObject: ProdutoTipoEnum,
            optionLabel: 'descricao'
        },
        {
            key: 'tamanho',
            label: 'Tamanho',
            type: 'text',
            placeholder: 'Buscar por tamanho'
        }
    ];

    constructor(
        tamanhoService: TamanhoService,
        messageService: MessageService,
        confirmationService: ConfirmationService
    ) {
        super(tamanhoService, messageService, confirmationService);
    }

    override criarInstancia(): Tamanho {
        return {
            tipo: undefined,
            tamanho: ''
        };
    }

    override isFormularioValido(): boolean {
        return !!(this.model.tipo && this.model.tamanho?.trim());
    }

    override getEntityLabelSingular(): string {
        return 'Tamanho';
    }

    override getEntityLabelPlural(): string {
        return 'Tamanhos';
    }

    override buildDefaultFilter(): TamanhoFilter {
        return {
            page: 0,
            size: 10,
            sort: 'id',
            direction: 'ASC',
            tipo: null as any,
            tamanho: ''
        };
    }

    override getDeleteConfirmMessage(item: Tamanho): string {
        return `Deseja realmente excluir o tamanho "${item.tamanho}"?`;
    }

    override getBatchDeleteConfirmMessage(count: number): string {
        return `Deseja realmente excluir ${count} tamanho(s) selecionado(s)?`;
    }

    override getTableColumnCount(): number {
        return 3;
    }

    // Eventos do erm-data-grid

    onInitNewRow(event: ErmDataGridEvent) {
        // Inicializa com valores vazios
        event.data.tipo = undefined;
        event.data.tamanho = '';
    }

    onSavingItem(event: ErmDataGridEvent) {
        console.log('Dados do evento:', event.data); // Debug 1

        // Extrai apenas a key do enum para enviar ao backend
        let tipoKey: string | undefined;

        if (event.data.tipo) {
            if (typeof event.data.tipo === 'string') {
                // Já é uma string
                tipoKey = event.data.tipo;
            } else if (event.data.tipo.key) {
                // É um objeto enum do TypeScript
                tipoKey = event.data.tipo.key;
            }
        }

        const tamanho: any = {
            id: event.data.id,
            tipo: tipoKey, // Envia apenas a string do enum
            tamanho: event.data.tamanho
        };

        console.log('Dados a serem enviados:', tamanho); // Debug 2
        console.log('Tipo do campo tipo:', typeof tamanho.tipo); // Debug 3

        const id = tamanho.id;
        const operacao = id
            ? this.service.atualizar(id, tamanho)
            : this.service.criar(tamanho);

        operacao.subscribe({
            next: (response) => {
                console.log('Resposta do servidor:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso`
                });
                this.carregar();
            },
            error: (error) => {
                console.error('Erro completo:', error);
                console.error('Status:', error.status);
                console.error('Corpo do erro:', error.error);

                let errorMessage = 'Erro ao salvar';
                if (error.error?.message) {
                    errorMessage = error.error.message;
                } else if (error.error?.error) {
                    errorMessage = error.error.error;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMessage
                });
            }
        });
    }

    onDeletingItem(event: ErmDataGridEvent) {
        const tamanho = event.data as Tamanho;
        const id = tamanho.id;

        if (id) {
            this.service.deletar(id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: `${this.getEntityLabelSingular()} excluído com sucesso`
                    });
                    this.carregar(); // Recarrega a lista
                },
                error: (error) => {
                    console.error('Erro ao excluir:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}`
                    });
                }
            });
        }
    }

    // Método auxiliar para obter a descrição do enum
    getTipoDescricao(tipo: any): string {
        if (!tipo) return '';

        // Se for uma string (vindo do backend)
        if (typeof tipo === 'string') {
            const enumValue = Object.values(ProdutoTipoEnum).find(
                (e: any) => e.key === tipo
            ) as any;
            return enumValue?.descricao || tipo;
        }

        // Se for um objeto (enum do frontend)
        return tipo.descricao || tipo.key || '';
    }
}
