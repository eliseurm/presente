import { Component, Input } from '@angular/core';

@Component({
    selector: 'erm-lookup',
    standalone: true,
    template: ''
})
export class ErmLookupComponent {
    @Input() dataSource: any[] = [];
    @Input() displayExpr: string = 'name';
    @Input() valueExpr: string = 'id';
}
