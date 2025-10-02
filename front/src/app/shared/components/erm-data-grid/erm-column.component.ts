import { Component, ContentChild, Input } from '@angular/core';
import { ErmLookupComponent } from './erm-lookup.component';

@Component({
    selector: 'erm-column',
    standalone: true,
    template: ''
})
export class ErmColumnComponent {
    @Input() dataField!: string;
    @Input() caption?: string;
    @Input() dataType?: 'string' | 'number' | 'date' | 'boolean' | any;
    @Input() visible: boolean = true;
    @Input() width?: string | number;
    @Input() editCellTemplate?: string;
    @Input() cellTemplate?: string;

    @ContentChild(ErmLookupComponent) lookup?: ErmLookupComponent;
}
