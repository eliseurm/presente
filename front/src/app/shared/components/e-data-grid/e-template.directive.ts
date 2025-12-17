
import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[eTemplate]',
    standalone: true
})
export class ETemplateDirective {
    @Input() eTemplate: string = '';

    constructor(public template: TemplateRef<any>) {}

    get name(): string {
        return this.eTemplate;
    }
}
