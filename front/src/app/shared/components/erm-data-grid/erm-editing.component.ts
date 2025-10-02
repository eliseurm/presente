
import { Component, ContentChild, Input } from '@angular/core';
import { ErmPopupComponent } from './erm-popup.component';
import { ErmFormComponent } from './erm-form.component';

@Component({
    selector: 'erm-editing',
    standalone: true,
    template: ''
})
export class ErmEditingComponent {
    @Input() mode: 'popup' | 'inline' = 'popup';
    @Input() allowAdding: boolean = false;
    @Input() allowUpdating: boolean = false;
    @Input() allowDeleting: boolean = false;
    @Input() confirmDelete: boolean = true;

    @ContentChild(ErmPopupComponent) popup?: ErmPopupComponent;
    @ContentChild(ErmFormComponent) form?: ErmFormComponent;
}
