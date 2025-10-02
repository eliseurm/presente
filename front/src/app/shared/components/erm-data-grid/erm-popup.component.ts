import { Component, Input } from '@angular/core';

@Component({
    selector: 'erm-popup',
    standalone: true,
    template: ''
})
export class ErmPopupComponent {
    @Input() title: string = 'Editar';
    @Input() showTitle: boolean = true;
    @Input() width: string = '600px';
    @Input() height: string = 'auto';
}
