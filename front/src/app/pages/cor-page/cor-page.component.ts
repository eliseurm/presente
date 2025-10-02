import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import {Cor} from "@/shared/model/cor";
import {CorFilter} from "@/shared/model/filter/cor-filter";
import {CorService} from "@/services/cor.service";
import {FilterField} from "@/shared/components/crud-filter/filter-field";
import {CrudFilterComponent} from "@/shared/components/crud-filter/crud-filter.component";

@Component({
    selector: 'cor-page',
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
        ColorPickerModule,
        CrudFilterComponent
    ],
    templateUrl: './cor-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './cor-page.component.scss'
    ],
    providers: [MessageService, ConfirmationService]
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

    constructor(
        corService: CorService,
        messageService: MessageService,
        confirmationService: ConfirmationService
    ) {
        super(corService, messageService, confirmationService);
    }

    protected getFilterFields(): FilterField[] {
        return this.filterFields;
    }

    protected criarInstancia(): Cor {
        const hexInicial = '#000000';
        return {
            nome: '',
            corHex: hexInicial,
            corRgbA: this.hexToRgba(hexInicial)
        };
    }

    protected isFormularioValido(): boolean {
        return !!(this.currentItem.nome?.trim() && this.currentItem.corHex);
    }

    protected getEntityLabelSingular(): string {
        return 'Cor';
    }

    protected getEntityLabelPlural(): string {
        return 'Cores';
    }

    protected buildDefaultFilter(): CorFilter {
        return {
            page: 0,
            size: 10,
            sort: 'id',
            direction: 'ASC'
        };
    }

    protected getDeleteConfirmMessage(item: Cor): string {
        return `Deseja realmente excluir a cor "${item.nome}"?`;
    }

    protected getBatchDeleteConfirmMessage(count: number): string {
        return `Deseja realmente excluir ${count} cor(es) selecionada(s)?`;
    }

    protected getTableColumnCount(): number {
        return 3; // Nome, Exemplo de Cor, Código Hex
    }

    onColorChange(event: any) {
        // O ColorPicker pode retornar string ou objeto, então tratamos ambos
        const color = typeof event === 'string' ? event : event?.value || event;

        if (color && typeof color === 'string') {
            // Remove o # se existir e adiciona novamente
            const hexColor = color.startsWith('#') ? color : `#${color}`;
            this.currentItem.corHex = hexColor;

            // Converte HEX para RGBA automaticamente
            this.currentItem.corRgbA = this.hexToRgba(hexColor);
        }
    }

    onHexChange(hex: string) {
        if (hex && typeof hex === 'string') {
            // Converte HEX para RGBA automaticamente quando digitado
            this.currentItem.corRgbA = this.hexToRgba(hex);
        }
    }

    /**
     * Converte cor HEX para RGBA
     */
    private hexToRgba(hex: string, alpha: number = 1): string {
        // Remove o # se existir
        hex = hex.replace('#', '');

        // Converte hex curto (#RGB) para hex longo (#RRGGBB)
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // Garante que temos 6 caracteres
        if (hex.length !== 6) {
            return `rgba(0, 0, 0, ${alpha})`;
        }

        // Extrai os valores RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    override novo() {
        super.novo();
        // Inicializa o RGBA quando criar uma nova cor
        this.currentItem.corRgbA = this.hexToRgba(this.currentItem.corHex || '#000000');
    }

    override editar(item: Cor) {
        super.editar(item);
        // Se não tiver RGBA, gera a partir do HEX
        if (!this.currentItem.corRgbA && this.currentItem.corHex) {
            this.currentItem.corRgbA = this.hexToRgba(this.currentItem.corHex);
        }
    }
}
