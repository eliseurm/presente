import { Component, Input } from '@angular/core';

@Component({
    selector: 'eo-lookup',
    standalone: true,
    template: ''
})
export class EoLookupComponent {
    @Input() dataSource: any[] = [];
    @Input() displayExpr: string = 'name';
    @Input() valueExpr: string = 'id';
}
