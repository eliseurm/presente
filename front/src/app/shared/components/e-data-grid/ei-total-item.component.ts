import { Component, Input } from '@angular/core';

export type SummaryType = 'count' | 'sum' | 'min' | 'max';

@Component({
    selector: 'ei-total-item',
    standalone: true,
    template: ''
})
export class EiTotalItemComponent {
    @Input() column?: string;
    @Input() summaryType: SummaryType = 'count';
    @Input() label?: string;
}
