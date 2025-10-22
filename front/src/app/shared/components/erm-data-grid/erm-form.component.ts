
import { Component, ContentChildren, Input, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { ErmItemComponent } from './erm-item.component';

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

    @ContentChildren(ErmItemComponent) items!: QueryList<ErmItemComponent>;

    // Template do conteúdo projetado, para ser renderizado pelo grid
    // no diálogo de edição.
    //@ts-ignore
    @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<any>;
}
