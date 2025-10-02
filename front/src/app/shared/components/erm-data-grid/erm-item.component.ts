import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { ErmValidationRuleComponent } from './erm-validation-rule.component';

@Component({
    selector: 'erm-item',
    standalone: true,
    template: ''
})
export class ErmItemComponent {
    @Input() dataField!: string;
    @Input() label?: string;
    @Input() colSpan?: number;
    @Input() editorType?: 'text' | 'number' | 'date' | 'dropdown' | 'template';

    @ContentChildren(ErmValidationRuleComponent) validationRules!: QueryList<ErmValidationRuleComponent>;
}
