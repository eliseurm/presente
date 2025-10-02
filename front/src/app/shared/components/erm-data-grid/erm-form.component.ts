
import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { ErmItemComponent } from './erm-item.component';

@Component({
    selector: 'erm-form',
    standalone: true,
    template: ''
})
export class ErmFormComponent {
    @Input() colCount: number = 1;

    @ContentChildren(ErmItemComponent) items!: QueryList<ErmItemComponent>;
}
