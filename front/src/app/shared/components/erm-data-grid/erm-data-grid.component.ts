import { Component, ContentChildren, QueryList, Input, Output, EventEmitter, TemplateRef, ContentChild, AfterContentInit } from '@angular/core';
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
export class ErmDataGridComponent implements AfterContentInit {
    @Input() dataSource: any[] = [];
    @Input() loading: boolean = false;
    // Scroll configuration passthrough to PrimeNG p-table
    @Input() scrollable: boolean = false;
    @Input() scrollHeight?: string;
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
        const value = rowData[column.dataField];

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
