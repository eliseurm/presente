
import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[ermTemplate]',
    standalone: true
})
export class ErmTemplateDirective {
    @Input() ermTemplate: string = '';

    constructor(public template: TemplateRef<any>) {}

    get name(): string {
        return this.ermTemplate;
    }
}
