import { Component, ContentChildren, Input, Optional, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ErmValidationRuleComponent } from './erm-validation-rule.component';
import { ErmFormContextService } from './erm-form-context.service';

@Component({
    selector: 'erm-item',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, InputNumberModule, DatePickerModule, SelectModule],
    template: `
        <!-- Quando usado dentro de conteúdo projetado com contexto, renderiza inline; caso contrário, atua apenas como metadado -->
        <ng-container *ngIf="ctx as c">
            <!-- Só renderiza quando existir uma linha em edição; evita erros ao abrir a página -->
            <ng-container *ngIf="c?.row as row">
                <div class="erm-form-item"
                     [class.has-error]="!!c.hasError?.(dataField)"
                     [style.grid-column]="colSpan ? 'span ' + colSpan : null">
                    <label [for]="dataField">
                        {{ label || dataField }}
                        <span *ngIf="c.isFieldRequired?.(this)" class="required-mark">*</span>
                    </label>

                    <!-- Campo com template customizado definido na coluna -->
                    <ng-container *ngIf="c.getColumnByDataField?.(dataField)?.editCellTemplate; else autoEditors">
                        <div [class.field-error]="!!c.hasError?.(dataField)">
                            <ng-container *ngTemplateOutlet="c.getTemplate?.(c.getColumnByDataField?.(dataField)!.editCellTemplate!)!; context: { $implicit: row, data: row, dataField: dataField, onChange: c.setFormItemValue?.bind(c) }">
                            </ng-container>
                        </div>
                    </ng-container>

                    <!-- Editores automáticos -->
                    <ng-template #autoEditors>
                        <!-- Texto (default) -->
                        <input
                            *ngIf="!c.getColumnByDataField?.(dataField)?.dataType || c.getColumnByDataField?.(dataField)?.dataType === 'string'"
                            pInputText
                            [id]="dataField"
                            [(ngModel)]="row[dataField]"
                            [ngModelOptions]="{standalone:true}"
                            (ngModelChange)="c.setFormItemValue?.(dataField, $event)"
                            [disabled]="dataField === 'id' && !c.isNewRow"
                            [class.ng-invalid]="!!c.hasError?.(dataField)"
                            [class.ng-dirty]="!!c.hasError?.(dataField)"
                            class="w-full" />

                        <!-- Número -->
                        <div *ngIf="c.getColumnByDataField?.(dataField)?.dataType === 'number'" [class.field-error]="!!c.hasError?.(dataField)">
                            <p-inputnumber
                                [inputId]="dataField"
                                [(ngModel)]="row[dataField]"
                                [ngModelOptions]="{standalone:true}"
                                (ngModelChange)="c.setFormItemValue?.(dataField, $event)"
                                styleClass="w-full">
                            </p-inputnumber>
                        </div>

                        <!-- Data -->
                        <div *ngIf="c.getColumnByDataField?.(dataField)?.dataType === 'date'" [class.field-error]="!!c.hasError?.(dataField)">
                            <p-datepicker
                                [inputId]="dataField"
                                [(ngModel)]="row[dataField]"
                                [ngModelOptions]="{standalone:true}"
                                (ngModelChange)="c.setFormItemValue?.(dataField, $event)"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                styleClass="w-full">
                            </p-datepicker>
                        </div>

                        <!-- Lookup (dropdown) -->
                        <div *ngIf="c.getColumnByDataField?.(dataField)?.lookup" [class.field-error]="!!c.hasError?.(dataField)">
                            <p-select
                                [inputId]="dataField"
                                [(ngModel)]="row[dataField]"
                                [ngModelOptions]="{standalone:true}"
                                (ngModelChange)="c.setFormItemValue?.(dataField, $event)"
                                [options]="c.getColumnByDataField?.(dataField)!.lookup!.dataSource"
                                [optionLabel]="c.getColumnByDataField?.(dataField)!.lookup!.displayExpr"
                                [optionValue]="c.getColumnByDataField?.(dataField)!.lookup!.valueExpr"
                                [showClear]="true"
                                placeholder="Selecione..."
                                styleClass="w-full">
                            </p-select>
                        </div>
                    </ng-template>

                    <!-- Mensagens de validação inline -->
                    <small *ngFor="let error of (c.getErrors?.(dataField) || [])" class="p-error">
                        {{ error }}
                    </small>
                </div>
            </ng-container>
        </ng-container>
    `
})
export class ErmItemComponent {
    @Input() dataField!: string;
    @Input() label?: string;
    @Input() colSpan?: number;
    @Input() editorType?: 'text' | 'number' | 'date' | 'dropdown' | 'template' | 'enum';

    @ContentChildren(ErmValidationRuleComponent) validationRules!: QueryList<ErmValidationRuleComponent>;

    constructor(@Optional() public ctx?: ErmFormContextService) {}
}
