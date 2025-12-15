import {Component, ContentChildren, QueryList, Input, Output, EventEmitter, TemplateRef, ContentChild, AfterContentInit, SimpleChanges, OnChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';

import { ErmColumnComponent } from './erm-column.component';
import { ErmEditingComponent } from './erm-editing.component';
import { ErmTemplateDirective } from './erm-template.directive';
import { ErmDataGridEvent } from './erm-data-grid.types';
import { ErmItemComponent } from './erm-item.component';
import { ErmFormContextComponent } from './erm-form-context.component';
import {EoSomatoriaComponent} from "@/shared/components/erm-data-grid/eo-somatoria.component";
import {EiTotalItemComponent, SummaryType} from "@/shared/components/erm-data-grid/ei-total-item.component";

@Component({
    selector: 'erm-data-grid',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        DatePickerModule,
        SelectModule,
        ConfirmDialogModule,
        ToastModule,
        MessageModule,
        ErmFormContextComponent
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './erm-data-grid.component.html',
    styleUrls: ['./erm-data-grid.component.scss'],
    animations: [
        trigger('slideDown', [
            state('void', style({
                height: '0',
                opacity: '0',
                overflow: 'hidden'
            })),
            state('*', style({
                height: '*',
                opacity: '1',
                overflow: 'visible'
            })),
            transition('void => *', [
                animate('300ms ease-out')
            ]),
            transition('* => void', [
                animate('300ms ease-in')
            ])
        ])
    ]
})
export class ErmDataGridComponent implements AfterContentInit, OnChanges {
    @Input() dataSource: any[] = [];
    @Input() loading: boolean = false;
    // Scroll configuration passthrough to PrimeNG p-table
    @Input() scrollable: boolean = false;
    @Input() scrollHeight?: string;
    // Pagination passthrough
    @Input() paginator: boolean = false;
    @Input() rows: number = 10;
    @Input() rowsPerPageOptions: number[] = [];
    @Input() totalRecords: number = 0;
    @Input() lazy: boolean = false;
    // Fonte alternativa para somatórios (ex.: total geral, ignorando paginação)
    @Input() summaryDataSource?: any[];
    @ContentChild(EoSomatoriaComponent) summaryContainer?: EoSomatoriaComponent;
    // Precisa capturar itens mesmo quando aninhados dentro de <eo-somatoria>
    @ContentChildren(EiTotalItemComponent, { descendants: true }) summaryItems?: QueryList<EiTotalItemComponent>;

    @Output() onLazyLoad = new EventEmitter<any>();
    // Row double click
    @Output() rowDblClick = new EventEmitter<any>();
    @Output() onInitNewRow = new EventEmitter<ErmDataGridEvent>();
    @Output() onSaving = new EventEmitter<ErmDataGridEvent>();
    @Output() onSaved = new EventEmitter<ErmDataGridEvent>();
    @Output() onDeleting = new EventEmitter<ErmDataGridEvent>();
    @Output() onDeleted = new EventEmitter<ErmDataGridEvent>();
    // Evento emitido quando o diálogo de edição é aberto (novo ou edição)
    @Output() onEditDialogOpen = new EventEmitter<ErmDataGridEvent>();

    @ContentChildren(ErmColumnComponent) columns!: QueryList<ErmColumnComponent>;
    @ContentChild(ErmEditingComponent) editing!: ErmEditingComponent;
    @ContentChildren(ErmTemplateDirective) templates!: QueryList<ErmTemplateDirective>;

    displayDialog = false;
    editingRow: any = null;
    isNewRow = false;
    templatesMap: Map<string, TemplateRef<any>> = new Map();
    validationErrors: Map<string, string[]> = new Map();
    showValidationMessage = false;
    validationMessage = '';

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngAfterContentInit() {
        // Mapeia os templates customizados
        this.templates.forEach(template => {
            this.templatesMap.set(template.name, template.template);
        });

        // Reagir a mudanças nas definições de somatória e colunas
        this.summaryItems?.changes.subscribe(() => this._invalidateTotalsCache());
        this.columns?.changes.subscribe(() => this._invalidateTotalsCache());
        // Invalida cache inicial
        this._invalidateTotalsCache();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Quando dataSource muda externamente, recalcula rodapé (lazy)
        if (changes['dataSource'] || changes['summaryDataSource']) {
            this._invalidateTotalsCache();
        }
    }

    // Emit PrimeNG lazy load events to consumer
    handleLazyLoad(event: any) {
        this.onLazyLoad.emit(event);
    }

    // Emit row double-click events to consumer
    onRowDoubleClick(rowData: any) {
        this.rowDblClick.emit(rowData);
    }

    get visibleColumns() {
        return this.columns?.filter(col => col.visible !== false) || [];
    }

    get editingConfig() {
        return this.editing || {
            mode: 'popup',
            allowAdding: false,
            allowUpdating: false,
            allowDeleting: false,
            confirmDelete: true
        };
    }

    get formItems(): QueryList<ErmItemComponent> | null {
        return this.editing?.form?.items || null;
    }

    get formColCount(): number {
        return this.editing?.form?.colCount || 1;
    }

    get popupConfig() {
        return this.editing?.popup || {
            title: 'Editar',
            showTitle: true,
            width: '600px',
            height: 'auto'
        };
    }

    addNewRow() {
        this.isNewRow = true;
        this.editingRow = {};
        this.validationErrors.clear();
        this.showValidationMessage = false;

        const event: ErmDataGridEvent = {
            data: this.editingRow,
            isNew: true
        };

        this.onInitNewRow.emit(event);
        this.onEditDialogOpen.emit(event);
        this.displayDialog = true;
    }

    editRow(rowData: any) {
        this.isNewRow = false;
        this.editingRow = { ...rowData };
        this.validationErrors.clear();
        this.showValidationMessage = false;
        const event: ErmDataGridEvent = {
            data: this.editingRow,
            isNew: false
        };
        this.onEditDialogOpen.emit(event);
        this.displayDialog = true;
    }

    deleteRow(rowData: any) {
        if (this.editingConfig.confirmDelete) {
            this.confirmationService.confirm({
                message: 'Deseja realmente excluir este registro?',
                header: 'Confirmação',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                accept: () => {
                    this.performDelete(rowData);
                }
            });
        } else {
            this.performDelete(rowData);
        }
    }

    performDelete(rowData: any) {
        const event: ErmDataGridEvent = {
            data: rowData,
            isNew: false
        };

        this.onDeleting.emit(event);

        const index = this.dataSource.indexOf(rowData);
        if (index > -1) {
            this.dataSource.splice(index, 1);
        }

        this.onDeleted.emit(event);

        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Registro excluído com sucesso!'
        });
    }

    saveRow() {
        // Valida o formulário antes de salvar
        if (!this.validateForm()) {
            this.validationMessage = 'Por favor, corrija os erros antes de salvar.';
            this.showValidationMessage = true;

            // Esconde a mensagem após 3 segundos
            setTimeout(() => {
                this.showValidationMessage = false;
            }, 3000);

            return;
        }

        const event: ErmDataGridEvent = {
            data: this.editingRow,
            isNew: this.isNewRow
        };

        this.onSaving.emit(event);

        if (this.isNewRow) {
            this.dataSource.push({ ...this.editingRow });
        } else {
            const index = this.dataSource.findIndex(item =>
                this.getRowId(item) === this.getRowId(this.editingRow)
            );
            if (index > -1) {
                this.dataSource[index] = { ...this.editingRow };
            }
        }

        this.onSaved.emit(event);

        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Registro ${this.isNewRow ? 'criado' : 'atualizado'} com sucesso!`
        });

        this.closeDialog();
    }

/*
    validateForm(): boolean {
        this.validationErrors.clear();
        let isValid = true;

        if (!this.formItems) {
            return true;
        }

        this.formItems.forEach(item => {
            const errors: string[] = [];
            const value = this.editingRow[item.dataField];

            if (item.validationRules) {
                item.validationRules.forEach(rule => {
                    if (rule.type === 'required') {
                        if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
                            errors.push(rule.message);
                            isValid = false;
                        }
                    } else if (rule.type === 'email') {
                        if (value && typeof value === 'string') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                                errors.push(rule.message);
                                isValid = false;
                            }
                        }
                    } else if (rule.type === 'pattern' && rule.pattern) {
                        if (value && typeof value === 'string') {
                            const regex = new RegExp(rule.pattern);
                            if (!regex.test(value)) {
                                errors.push(rule.message);
                                isValid = false;
                            }
                        }
                    }
                });
            }

            if (errors.length > 0) {
                this.validationErrors.set(item.dataField, errors);
            }
        });

        return isValid;
    }
*/

    validateForm(): boolean {
        this.validationErrors.clear();
        let isValid = true;

        if (!this.formItems) {
            return true;
        }

        this.formItems.forEach(item => {
            const errors: string[] = [];
            const value = this.editingRow[item.dataField];

            if (item.validationRules) {
                item.validationRules.forEach(rule => {
                    if (rule.type === 'required') {
                        // Verifica valores vazios, incluindo objetos vazios
                        const isEmpty = value === null ||
                            value === undefined ||
                            value === '' ||
                            (typeof value === 'string' && value.trim() === '') ||
                            (typeof value === 'object' && Object.keys(value).length === 0);

                        if (isEmpty) {
                            errors.push(rule.message);
                            isValid = false;
                        }
                    } else if (rule.type === 'email') {
                        if (value && typeof value === 'string') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                                errors.push(rule.message);
                                isValid = false;
                            }
                        }
                    } else if (rule.type === 'pattern' && rule.pattern) {
                        if (value && typeof value === 'string') {
                            const regex = new RegExp(rule.pattern);
                            if (!regex.test(value)) {
                                errors.push(rule.message);
                                isValid = false;
                            }
                        }
                    }
                });
            }

            if (errors.length > 0) {
                this.validationErrors.set(item.dataField, errors);
            }
        });

        return isValid;
    }

    hasError(dataField: string): boolean {
        return this.validationErrors.has(dataField);
    }

    getErrors(dataField: string): string[] {
        return this.validationErrors.get(dataField) || [];
    }

    closeDialog() {
        this.displayDialog = false;
        this.editingRow = null;
        this.isNewRow = false;
        this.validationErrors.clear();
        this.showValidationMessage = false;
    }

    getRowId(row: any): any {
        return row.id || row;
    }

    getCellValue(rowData: any, column: ErmColumnComponent): any {
        const value = this.getByPath(rowData, column.dataField);

        if (column.lookup) {
            const lookupItem = column.lookup.dataSource.find(
                item => item[column.lookup!.valueExpr] === value
            );
            return lookupItem ? lookupItem[column.lookup.displayExpr] : value;
        }

        if (column.dataType === 'date' && value) {
            return new Date(value).toLocaleDateString('pt-BR');
        }

        // Exibe objetos (ex.: enums com descricao) de forma amigável
        if (value && typeof value === 'object') {
            // Enum/objeto com descricao
            if ('descricao' in value && (value as any).descricao) {
                return (value as any).descricao;
            }
            // Opções comuns
            if ('label' in value && (value as any).label) {
                return (value as any).label;
            }
            if ('nome' in value && (value as any).nome) {
                return (value as any).nome;
            }
            if ('key' in value && (value as any).key) {
                return (value as any).key;
            }
        }

        return value;
    }

    // Resolve valores por caminho aninhado, ex.: "cliente.endereco.rua" ou "itens[0].nome"
    // Regras:
    // - Se path for vazio/nulo/undefined, retorna undefined
    // - Suporta índices numéricos em colchetes e propriedades com ponto
    // - Suporta chaves entre aspas dentro de colchetes: ["prop.com.ponto"], ['outra']
    public getByPath(obj: any, path?: string | null): any {
        if (!obj || !path) return undefined;

        // Tokeniza: propriedades por ponto e colchetes
        const tokens = this.tokenizePath(path);
        let current = obj;
        for (const token of tokens) {
            if (current == null) return undefined;
            if (typeof token === 'number') {
                // Índice de array
                if (!Array.isArray(current)) return undefined;
                current = current[token];
            } else {
                current = current[token as string];
            }
        }
        return current;
    }

    private tokenizePath(path: string): Array<string | number> {
        // Extrai partes como: foo, bar, 0, "a.b", 'c.d'
        const re = /[^.\[\]]+|\[(?:-?\d+|\".*?\"|'.*?')\]/g;
        const raw: string[] = path.match(re) || [];
        const out: Array<string | number> = [];
        for (let part of raw) {
            // Remove colchetes quando presentes
            if (part.startsWith('[') && part.endsWith(']')) {
                part = part.slice(1, -1);
                // Índice numérico simples
                if (/^-?\d+$/.test(part)) {
                    out.push(parseInt(part, 10));
                    continue;
                }
                // Remover aspas envolvendo chaves com ponto
                if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
                    part = part.slice(1, -1);
                }
                out.push(part);
            } else {
                out.push(part);
            }
        }
        return out;
    }

    // ===================== SOMATÓRIA (Resumo) =====================
    private _totalsCache: Map<string, number> | null = null;

    private _invalidateTotalsCache() {
        this._totalsCache = null;
    }

    get summariesEnabled(): boolean {
        return !!this.summaryContainer && !!this.summaryItems && (this.summaryItems?.length || 0) > 0;
    }

    private computeTotals(): Map<string, number> {
        if (this._totalsCache) return this._totalsCache;
        const map = new Map<string, number>();
        const items = this.summaryItems?.toArray() || [];
        const data = (this.summaryDataSource ?? this.dataSource) || [];

        for (const item of items) {
            const key = (item.column || '__general__') + '::' + item.summaryType;
            let total = 0;
            if (item.summaryType === 'count') {
                if (item.column) {
                    // conta valores não nulos da coluna
                    for (const row of data) {
                        const v = this.getByPath(row, item.column!);
                        if (v !== undefined && v !== null) total += 1;
                    }
                } else {
                    // count geral (todas as linhas)
                    total = data.length || 0;
                }
            } else if (item.summaryType === 'sum') {
                for (const row of data) {
                    const v = this.getByPath(row, item.column!);
                    if (typeof v === 'number') {
                        total += v;
                    } else if (typeof v === 'boolean') {
                        total += v ? 1 : 0;
                    }
                }
            } else if (item.summaryType === 'min') {
                let currentMin: number | undefined = undefined;
                for (const row of data) {
                    const v = this.getByPath(row, item.column!);
                    let num: number | undefined;
                    if (typeof v === 'number') num = v;
                    else if (typeof v === 'boolean') num = v ? 1 : 0;
                    if (num !== undefined) {
                        currentMin = currentMin === undefined ? num : Math.min(currentMin, num);
                    }
                }
                if (currentMin !== undefined) total = currentMin; else total = NaN as any;
            } else if (item.summaryType === 'max') {
                let currentMax: number | undefined = undefined;
                for (const row of data) {
                    const v = this.getByPath(row, item.column!);
                    let num: number | undefined;
                    if (typeof v === 'number') num = v;
                    else if (typeof v === 'boolean') num = v ? 1 : 0;
                    if (num !== undefined) {
                        currentMax = currentMax === undefined ? num : Math.max(currentMax, num);
                    }
                }
                if (currentMax !== undefined) total = currentMax; else total = NaN as any;
            }
            map.set(key, total);
        }

        this._totalsCache = map;
        return map;
    }

    getFooterTextForColumn(colDataField: string, isFirstColumn: boolean): string | null {
        if (!this.summariesEnabled) return null;
        const totals = this.computeTotals();

        // Coleciona itens de somatória desta coluna
        const items = (this.summaryItems?.toArray() || []).filter(i => i.column === colDataField);
        const parts: string[] = [];
        const formatLabel = (itemType: SummaryType, custom?: string, general?: boolean) => {
            if (custom) return custom;
            if (general && itemType === 'count') return 'Total';
            switch (itemType) {
                case 'count': return 'Qtde';
                case 'sum': return 'Soma';
                case 'min': return 'Mín';
                case 'max': return 'Máx';
                default: return '';
            }
        };

        // Adiciona os itens desta coluna
        for (const it of items) {
            const key = (it.column || '__general__') + '::' + it.summaryType;
            const val = totals.get(key as any);
            if (val === undefined || Number.isNaN(val as any)) continue;
            const label = formatLabel(it.summaryType, it.label);
            parts.push(label ? `${label}: ${val}` : String(val));
        }

        // Count geral sem coluna específica -> primeira coluna
        if (isFirstColumn) {
            const general = (this.summaryItems?.toArray() || []).filter(i => !i.column && i.summaryType === 'count');
            for (const it of general) {
                const key = '__general__::count';
                const val = totals.get(key);
                if (val === undefined) continue;
                const label = formatLabel('count', it.label, true);
                parts.unshift(label ? `${label}: ${val}` : String(val));
            }
        }

        return parts.length ? parts.join(' • ') : null;
    }


    getFormItemValue(dataField: string): any {
        return this.editingRow[dataField];
    }

    setFormItemValue(dataField: string, value: any): void {
        this.editingRow[dataField] = value;
        // Remove os erros do campo quando o valor é alterado
        if (this.validationErrors.has(dataField)) {
            this.validationErrors.delete(dataField);
        }
    }

    getColumnByDataField(dataField: string): ErmColumnComponent | undefined {
        return this.columns?.find(col => col.dataField === dataField);
    }

    getFormItemLabel(item: ErmItemComponent): string {
        return item.label || item.dataField;
    }

    getTemplate(templateName: string): TemplateRef<any> | null {
        const template = this.templatesMap.get(templateName);
        // console.log('Buscando template:', templateName, 'Encontrado:', !!template); // Debug
        return template || null;
    }

    isFieldRequired(item: ErmItemComponent): boolean {
        return item.validationRules?.some(rule => rule.type === 'required') || false;
    }

    getValidationMessages(item: ErmItemComponent): string[] {
        return item.validationRules?.map(rule => rule.message) || [];
    }

    hasValidationErrors(): boolean {
        return this.validationErrors.size > 0;
    }
}
