// TypeScript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';

// Registra os dados do locale "pt" para pipes (moeda, data, número, etc.)
registerLocaleData(localePt);

export type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco?: number;
    tamanhos: { id: number; label: string }[];
    cores?: { id: number; label: string }[];
    imagens: string[];
    tamanhoSelecionado?: { id: number; label: string } | null;
    corSelecionada?: { id: number; label: string } | null;
};

@Component({
    selector: 'app-produto',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, GalleriaModule, SelectButtonModule, ButtonModule],
    templateUrl: './produto-component.html',
    styleUrls: ['./produto-component.scss'],
    providers: [CurrencyPipe]
})
export class ProdutoComponent {
    @Input() produto!: Produto;
    @Input() selected = false;
    @Input() disabled = false;
    @Input() compact = false;
    @Input() errors: string[] = [];

    @Output() toggle = new EventEmitter<void>();

    get tamanhoOptions() {
        return (this.produto?.tamanhos ?? []).map((t) => ({ label: t.label ?? String(t), value: t }));
    }

    get corOptions() {
        return (this.produto?.cores ?? []).map((c) => ({ label: c.label ?? String(c), value: c }));
    }

    onToggleClick() {
        this.toggle.emit();
    }
}
