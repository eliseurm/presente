import { Component, ContentChild, Input } from '@angular/core';
import { EoLookupComponent } from './eo-lookup.component';

@Component({
    selector: 'ei-column',
    standalone: true,
    template: ''
})
export class EiColumnComponent {
    @Input() dataField!: string;
    @Input() caption?: string;
    @Input() dataType?: 'string' | 'number' | 'date' | 'boolean' | any;
    @Input() visible: boolean = true;
    @Input() width?: string | number;
    @Input() editCellTemplate?: string;
    @Input() cellTemplate?: string;

    @ContentChild(EoLookupComponent) lookup?: EoLookupComponent;
}
