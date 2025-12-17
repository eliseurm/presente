import { Component, Input } from '@angular/core';

@Component({
    selector: 'e-popup',
    standalone: true,
    template: ''
})
export class EPopupComponent {
    @Input() title: string = 'Editar';
    @Input() showTitle: boolean = true;
    @Input() width: string = '600px';
    @Input() height: string = 'auto';
}
