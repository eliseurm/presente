import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SelectModule} from 'primeng/select';

@Component({
    selector: 'enum-select',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    template: `
        <div class="field">
            @if(label){
                <label class="block mb-2">{{ label }}</label>
            }
            <p-select
                [options]="options"
                [(ngModel)]="selectedValue"
                (onChange)="onSelectionChange($event)"
                [optionLabel]="optionLabel"
                [placeholder]="placeholder"
                [showClear]="true"
                appendTo="body"
                styleClass="w-full">
            </p-select>
        </div>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EnumSelectComponent),
            multi: true
        }
    ]
})
export class EnumSelectComponent implements OnInit, ControlValueAccessor {

    @Input({ required: true }) enumObject: object = {};
    @Input() optionLabel: string = 'descricao';
    @Input() placeholder: string = 'Selecione...';
    @Input() label: string = '';

    options: any[] = [];
    selectedValue: any = null;
    onChange: any = () => {};
    onTouch: any = () => {};

    ngOnInit(): void {
        if (this.enumObject) {
            this.options = Object.values(this.enumObject);
        }
    }

    onSelectionChange(event: any): void {
        const value = event.value;
        this.selectedValue = value;
        this.onChange(value);
        this.onTouch();
    }

    writeValue(value: any): void {
        this.selectedValue = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
}
