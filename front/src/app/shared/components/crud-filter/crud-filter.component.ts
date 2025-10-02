import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { BaseFilter } from '@/shared/model/filter/base-filter';
import {FilterField} from "@/shared/components/crud-filter/filter-field";


@Component({
    selector: 'crud-filter',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        Select
    ],
    templateUrl: './crud-filter.component.html',
    styleUrls: ['./crud-filter.component.scss']
})
export class CrudFilterComponent<F extends BaseFilter> {
    @Input() filter!: F;
    @Input() fields: FilterField[] = [];
    @Input() loading = false;

    @Output() onSearch = new EventEmitter<void>();
    @Output() onClear = new EventEmitter<void>();

    search() {
        this.onSearch.emit();
    }

    clear() {
        this.onClear.emit();
    }

    handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.search();
        }
    }

    getFilterValue(key: string): any {
        return (this.filter as any)[key];
    }

    setFilterValue(key: string, value: any): void {
        (this.filter as any)[key] = value;
    }
}
