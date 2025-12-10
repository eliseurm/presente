
import { Component, ContentChildren, Input, Optional, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { ErmItemComponent } from './erm-item.component';
import { ErmFormContextService } from './erm-form-context.service';

@Component({
    selector: 'erm-form',
    standalone: true,
    template: `
        <ng-template #content let-data="data" let-ctx="$implicit">
            <ng-content></ng-content>
        </ng-template>
    `
})
export class ErmFormComponent {
    @Input() colCount: number = 1;
    // Quando true, usa o conteúdo projetado (HTML arbitrário) dentro do popup.
    // Quando false (padrão), o grid renderiza automaticamente os <erm-item> (autoForm).
    @Input() useContentProjection: boolean = false;

    // Usa descendants: true para capturar <erm-item> aninhados dentro de wrappers (div, p-tab, etc.)
    @ContentChildren(ErmItemComponent, { descendants: true }) items!: QueryList<ErmItemComponent>;

    // Template do conteúdo projetado, para ser renderizado pelo grid
    // no diálogo de edição.
    //@ts-ignore
    @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<any>;

    // O contexto é fornecido pelo ErmFormContextComponent quando o template projetado
    // é instanciado dentro do diálogo. Tornamos a injeção opcional para evitar NG0201
    // quando <erm-form> está fora desse contexto.
    constructor(@Optional() public ctx?: ErmFormContextService) {}
}
