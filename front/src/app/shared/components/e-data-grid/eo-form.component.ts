
import { Component, ContentChildren, Input, Optional, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { EiItemComponent } from './ei-item.component';
import { EoFormContextService } from './eo-form-context.service';

@Component({
    selector: 'eo-form',
    standalone: true,
    template: `
        <ng-template #content let-data="data" let-ctx="$implicit">
            <ng-content></ng-content>
        </ng-template>
    `
})
export class EoFormComponent {
    @Input() colCount: number = 1;
    // Quando true, usa o conteúdo projetado (HTML arbitrário) dentro do popup.
    // Quando false (padrão), o grid renderiza automaticamente os <ei-item> (autoForm).
    @Input() useContentProjection: boolean = false;

    // Usa descendants: true para capturar <ei-item> aninhados dentro de wrappers (div, p-tab, etc.)
    @ContentChildren(EiItemComponent, { descendants: true }) items!: QueryList<EiItemComponent>;

    // Template do conteúdo projetado, para ser renderizado pelo grid
    // no diálogo de edição.
    //@ts-ignore
    @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<any>;

    // O contexto é fornecido pelo EoFormContextComponent quando o template projetado
    // é instanciado dentro do diálogo. Tornamos a injeção opcional para evitar NG0201
    // quando <eo-form> está fora desse contexto.
    constructor(@Optional() public ctx?: EoFormContextService) {}
}
