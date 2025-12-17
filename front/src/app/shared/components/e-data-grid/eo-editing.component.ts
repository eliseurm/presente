
import { Component, ContentChild, Input } from '@angular/core';
import { EPopupComponent } from './e-popup.component';
import { EoFormComponent } from './eo-form.component';

@Component({
    selector: 'eo-editing',
    standalone: true,
    template: ''
})
export class EoEditingComponent {
    @Input() mode: 'popup' | 'inline' = 'popup';
    @Input() allowAdding: boolean = false;
    @Input() allowUpdating: boolean = false;
    @Input() allowDeleting: boolean = false;
    @Input() confirmDelete: boolean = true;

    @ContentChild(EPopupComponent) popup?: EPopupComponent;
    @ContentChild(EoFormComponent) form?: EoFormComponent;
}
