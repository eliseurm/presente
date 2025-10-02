import { Component, Input } from '@angular/core';

@Component({
    selector: 'erm-validation-rule',
    standalone: true,
    template: ''
})
export class ErmValidationRuleComponent {
    @Input() type: 'required' | 'email' | 'pattern' = 'required';
    @Input() message: string = '';
    @Input() pattern?: string;
}
