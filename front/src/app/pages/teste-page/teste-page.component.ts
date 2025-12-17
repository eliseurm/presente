import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    EDataGridComponent,
    EoEditingComponent,
    EPopupComponent,
    EoFormComponent,
    EiItemComponent,
    EiColumnComponent,
    EoLookupComponent,
    EiValidationRuleComponent,
    ETemplateDirective
} from "@/shared/components/e-data-grid";


@Component({
    selector: 'teste',
    standalone: true,
    imports: [
        CommonModule,
        EDataGridComponent,
        EoEditingComponent,
        EPopupComponent,
        EoFormComponent,
        EiItemComponent,
        EiColumnComponent,
        EoLookupComponent,
        EiValidationRuleComponent,
        ETemplateDirective
    ],
    templateUrl: './teste-page.component.html',
    styleUrl: './teste-page.component.scss'
})
export class TestePageComponent {

    notaList = [];

    clienteList = [
        { id: 1, nome: 'Cliente A' },
        { id: 2, nome: 'Cliente B' }
    ];

    onInitNewRowNota(event: any) {
        event.data.data = new Date();
    }

    onSavingNota(event: any) {
        console.log('Salvando...', event);
    }

    onSavedNota(event: any) {
        console.log('Salvo!', event);
    }
}
