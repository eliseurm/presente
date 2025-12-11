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
        const value = event?.value;
        this.selectedValue = value;
        // Emite a chave (string) do enum para o modelo do formulário
        // const emit = value?.key ?? value?.name ?? value ?? null;
        const emit = value ?? value?.key ?? value?.name ?? null;
        this.onChange(emit);
        this.onTouch();
    }

    writeValue(value: any): void {
        // Aceita string (ex.: 'ATIVO') ou objeto ({ key: 'ATIVO', descricao: 'Ativo' })
        if (value == null) {
            this.selectedValue = null;
            return;
        }
        // Se já for um objeto com 'key' e existir nas opções, alinhar pela referência da lista
        if (typeof value === 'object') {
            const key = value?.key ?? value?.name ?? null;
            if (key != null) {
                const found = this.findOptionByKeyOrDescricao(String(key));
                this.selectedValue = found ?? value;
                return;
            }
            // Sem chave conhecida, mantém como está
            this.selectedValue = value;
            return;
        }
        // Se for string, localizar a opção correspondente por key ou descricao
        const str = String(value);
        const found = this.findOptionByKeyOrDescricao(str);
        this.selectedValue = found ?? null;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    private findOptionByKeyOrDescricao(val: string): any | null {
        if (!this.options || this.options.length === 0) return null;
        const lower = val.toLowerCase();
        const byKey = this.options.find((o: any) => String(o?.key ?? o?.name ?? '').toLowerCase() === lower);
        if (byKey) return byKey;
        const byDesc = this.options.find((o: any) => String(o?.descricao ?? '').toLowerCase() === lower);
        return byDesc ?? null;
    }
}
