import { Component, Input } from '@angular/core';

@Component({
    selector: 'ei-validation-rule',
    standalone: true,
    template: ''
})
export class EiValidationRuleComponent {
    @Input() type: 'required' | 'email' | 'pattern' = 'required';
    @Input() message: string = '';
    @Input() pattern?: string;
}
