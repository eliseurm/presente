import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {DatePickerModule} from 'primeng/datepicker'; // Adicionar esta importação
import {BaseFilter} from '@/shared/model/core/base-filter';
import {FilterField} from "@/shared/components/crud-filter/filter-field";
import {generateFields} from "@/shared/core/generate-fields.funcrion";
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";


@Component({
    selector: 'crud-filter',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        Select,
        DatePickerModule,  // Adicionar aqui
        EnumSelectComponent
    ],
    templateUrl: './crud-filter.component.html',
    styleUrls: ['./crud-filter.component.scss']
})
export class CrudFilterComponent<F extends BaseFilter> implements OnInit {

    @Input() filter!: F;
    @Input() fields: FilterField[] = [];
    @Input() loading = false;

    @Output() onSearch = new EventEmitter<void>();
    @Output() onClear = new EventEmitter<void>();

    ngOnInit(): void {
        if (this.fields.length == 0) {
            this.fields = generateFields(this.filter);
        }
    }

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
