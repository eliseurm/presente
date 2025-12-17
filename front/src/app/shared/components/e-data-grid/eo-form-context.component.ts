import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateRef } from '@angular/core';
import { EoFormContextService } from './eo-form-context.service';

@Component({
    selector: 'eo-form-context',
    standalone: true,
    imports: [CommonModule],
    template: `
        <!--
          Renderizamos o template recebido DENTRO deste componente para que o injector
          local (que provê ErmFormContextService) seja usado pelos filhos, permitindo
          que <ei-item> injete o contexto e renderize inline.
        -->
        <ng-container *ngIf="template as tpl">
            <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="templateContext"></ng-container>
        </ng-container>
    `
})
export class EoFormContextComponent implements OnChanges {
    @Input() row: any = null;
    @Input() isNewRow: boolean = false;
    @Input() columns: any[] = [];
    @Input() templatesMap: Map<string, TemplateRef<any>> = new Map<string, TemplateRef<any>>();

    // Métodos recebidos do grid
    @Input() getTemplate!: (name: string) => (TemplateRef<any> | null | undefined);
    @Input() setFormItemValue!: (field: string, value: any) => void;
    @Input() getColumnByDataField!: (field: string) => any;
    @Input() hasError!: (field: string) => boolean;
    @Input() getErrors!: (field: string) => string[];
    @Input() isFieldRequired!: (item: any) => boolean;

    // Template do conteúdo projetado e seu contexto
    @Input() template?: TemplateRef<any>;
    @Input() templateContext: any;

    constructor(private ctx: EoFormContextService) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.ctx.row = this.row;
        this.ctx.isNewRow = this.isNewRow;
        this.ctx.columns = this.columns;
        this.ctx.templatesMap = this.templatesMap;
        this.ctx.getTemplate = this.getTemplate;
        this.ctx.setFormItemValue = this.setFormItemValue;
        this.ctx.getColumnByDataField = this.getColumnByDataField;
        this.ctx.hasError = this.hasError;
        this.ctx.getErrors = this.getErrors;
        this.ctx.isFieldRequired = this.isFieldRequired;
    }
}
