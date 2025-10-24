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
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {Evento} from "@/shared/model/evento";
import {EventoFilter} from "@/shared/model/filter/evento-filter";

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
@CrudMetadata("EventoPageComponent", [Tamanho, TamanhoFilter])
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

    override isFormularioValido(): boolean {
        return !!(this.model.tipo && this.model.tamanho?.trim());
    }

    // Eventos do erm-data-grid

    onInitNewRow(event: ErmDataGridEvent) {
        // Inicializa com valores vazios
        event.data.tipo = undefined;
        event.data.tamanho = '';
    }

    onSavingItem(event: ErmDataGridEvent) {
        // Normaliza o enum para enviar no formato aceito pelo backend.
        // Observação: Alguns ambientes estão configurados para ler enums via toString (descrição),
        // por isso vamos preferir enviar a descrição; se não houver, enviamos a key.
        let tipoKey: string | undefined;
        let tipoDescricao: string | undefined;
        const tipoValor = event?.data?.tipo;
        if (tipoValor) {
            const valoresEnum = Object.values(ProdutoTipoEnum) as any[];
            if (typeof tipoValor === 'string') {
                // Pode vir como a chave (ex.: 'ROUPA_ADULTO') ou a descrição (ex.: 'Roupa Adulto')
                const matchByKey = valoresEnum.find(v => v.key === tipoValor);
                if (matchByKey) {
                    tipoKey = matchByKey.key;
                    tipoDescricao = matchByKey.descricao;
                } else {
                    const alvo = (tipoValor || '').toString().toLowerCase();
                    const matchByDesc = valoresEnum.find(v => (v.descricao || '').toLowerCase() === alvo);
                    if (matchByDesc) {
                        tipoKey = matchByDesc.key;
                        tipoDescricao = matchByDesc.descricao;
                    }
                }
            } else if (typeof tipoValor === 'object') {
                // Pode vir como { key, descricao }
                tipoKey = (tipoValor as any).key ?? undefined;
                tipoDescricao = (tipoValor as any).descricao ?? undefined;
            }
        }

        const tamanhoStr = (event?.data?.tamanho ?? '').toString().trim();
        const tipoParaBack = tipoDescricao || tipoKey; // Preferimos descricao
        const payload: any = {
            id: event?.data?.id,
            tipo: tipoParaBack,
            tamanho: tamanhoStr
        };

        // Validações simples antes de persistir
        if (!payload.tipo) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione o tipo de produto' });
            return;
        }
        if (!payload.tamanho) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o tamanho' });
            return;
        }

        const id = payload.id;
        const operacao = id ? this.service.atualizar(id, payload) : this.service.criar(payload);

        operacao.subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: `Dados ${id ? 'atualizado' : 'criado'} com sucesso`
                });
                this.carregarDataSource();
            },
            error: (error) => {
                let errorMessage = 'Erro ao salvar';
                if (error?.error?.message) {
                    errorMessage = error.error.message;
                } else if (error?.error?.error) {
                    errorMessage = error.error.error;
                }
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
            }
        });
    }

    // Normaliza os dados carregados para que o campo "tipo" fique compatível com o enum do frontend
    override carregarDataSource(): void {
        this.loading = true;
        this.service.listar(this.filter).subscribe({
            next: (response: any) => {
                // Mapeia string vinda do backend para o objeto do enum (para o editor funcionar corretamente)
                const valoresEnum = Object.values(ProdutoTipoEnum) as any[];
                this.dataSource = (response.content || []).map((item: any) => {
                    const novo = { ...item };
                    if (typeof novo.tipo === 'string') {
                        // Tenta mapear por key (ex.: 'ROUPA_ADULTO')
                        let encontrado = valoresEnum.find(v => v.key === novo.tipo);
                        if (!encontrado) {
                            // Alguns backends podem serializar enum via toString() -> descricao (ex.: 'Roupa Adulto')
                            encontrado = valoresEnum.find(v => v.descricao === novo.tipo);
                        }
                        if (!encontrado) {
                            // Tenta comparação case-insensitive por descricao
                            const alvo = (novo.tipo || '').toString().toLowerCase();
                            encontrado = valoresEnum.find(v => (v.descricao || '').toLowerCase() === alvo);
                        }
                        if (encontrado) {
                            novo.tipo = encontrado;
                        }
                    }
                    return novo;
                });
                this.totalRecords = response.totalElements;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: `Erro ao carregar Informações`
                });
                this.loading = false;
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
                        detail: `Dado excluído com sucesso`
                    });
                    this.carregarDataSource(); // Recarrega a lista
                },
                error: (error) => {
                    console.error('Erro ao excluir:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: `Erro ao excluir informações`
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
