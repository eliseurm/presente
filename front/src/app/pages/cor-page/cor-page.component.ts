
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmPopupComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmColumnComponent,
    ErmValidationRuleComponent,
    ErmTemplateDirective
} from '../../shared/components/erm-data-grid';
import { CrudFilterComponent } from '../../shared/components/crud-filter/crud-filter.component';
import { CrudBaseComponent } from '../../shared/components/crud-base/crud-base.component';
import { CorService } from '../../services/cor.service';
import { FilterField } from '../../shared/components/crud-filter/filter-field';
import {Cor} from "@/shared/model/cor";
import {CorFilter} from "@/shared/model/filter/cor-filter";

@Component({
    selector: 'cor-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        ColorPickerModule,
        InputTextModule,
        ToastModule,
        CrudFilterComponent,
        ErmDataGridComponent,
        ErmEditingComponent,
        ErmPopupComponent,
        ErmFormComponent,
        ErmItemComponent,
        ErmColumnComponent,
        ErmValidationRuleComponent,
        ErmTemplateDirective
    ],
    templateUrl: './cor-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './cor-page.component.scss'
    ],
    providers: [MessageService]
})
export class CorPageComponent extends CrudBaseComponent<Cor, CorFilter> {

    readonly filterFields: FilterField[] = [
        {
            key: 'nome',
            label: 'Nome da Cor',
            type: 'text',
            placeholder: 'Buscar por nome'
        }
    ];

    constructor(corService: CorService,
                messageService: MessageService
    ) {
        super(corService, messageService, null as any);
    }

    override criarInstancia(): Cor {
        const hexInicial = '#000000';
        return {
            nome: '',
            corHex: hexInicial,
            corRgbA: this.hexToRgba(hexInicial)
        };
    }

    override isFormularioValido(): boolean {
        return !!(this.model.nome?.trim() && this.model.corHex);
    }

    override getEntityLabelSingular(): string {
        return 'Cor';
    }

    override getEntityLabelPlural(): string {
        return 'Cores';
    }

    override buildDefaultFilter(): CorFilter {
        return {
            page: 0,
            size: 10,
            sort: 'id',
            direction: 'ASC'
        };
    }

    override getDeleteConfirmMessage(item: Cor): string {
        return `Deseja realmente excluir a cor "${item.nome}"?`;
    }

    override getBatchDeleteConfirmMessage(count: number): string {
        return `Deseja realmente excluir ${count} cor(es) selecionada(s)?`;
    }

    override getTableColumnCount(): number {
        return 3;
    }

    carregarCores() {
        this.loading = true;
        this.service.listar(this.filter).subscribe({
            next: (response) => {
                this.dataSource = response.content;
                this.totalRecords = response.totalElements;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar cores'
                });
                this.loading = false;
            }
        });
    }

    onInitNewRow(event: any) {
        const hexInicial = '#000000';
        event.data.corHex = hexInicial;
        event.data.corRgbA = this.hexToRgba(hexInicial);
    }

    onSavingCor(event: any) {
        const data = event.data;

        if (!data.nome || !data.nome.trim()) {
            return;
        }

        // Garante que temos o RGBA
        if (!data.corRgbA && data.corHex) {
            data.corRgbA = this.hexToRgba(data.corHex);
        }

        if (event.isNew) {
            this.service.criar(data).subscribe({
                next: () => {
                    this.carregarCores();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao Salvar!!'
                    });
                }
            });
        } else {
            this.service.atualizar(data.id, data).subscribe({
                next: () => {
                    this.carregarCores();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao atualizar!!'
                    });
                }
            });
        }
    }

    onDeletingCor(event: any) {
        const data = event.data;
        this.service.deletar(data.id).subscribe({
            next: () => {
                this.carregarCores();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao excluir!!'
                });
            }
        });
    }

    onColorChange(cor: Cor, event: any) {
        const color = typeof event === 'string' ? event : event?.value || event;

        if (color && typeof color === 'string') {
            const hexColor = color.startsWith('#') ? color : `#${color}`;
            cor.corHex = hexColor;
            cor.corRgbA = this.hexToRgba(hexColor);
        }
    }

    onHexChange(cor: Cor, hex: string) {
        if (hex && typeof hex === 'string') {
            cor.corRgbA = this.hexToRgba(hex);
        }
    }

    /**
     * Converte cor HEX para RGBA
     */
    hexToRgba(hex: string, alpha: number = 1): string {
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        if (hex.length !== 6) {
            return `rgba(0, 0, 0, ${alpha})`;
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    override filtrar() {
        this.filter.page = 0;
        this.carregarCores();
    }

    override limpar() {
        super.limpar();
        this.carregarCores();
    }
}
