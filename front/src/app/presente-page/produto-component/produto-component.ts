// TypeScript
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { GalleriaModule } from 'primeng/galleria';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { ProdutoEstoque } from '@/shared/model/produto-estoque';

// Registra os dados do locale "pt" para pipes (moeda, data, número, etc.)
registerLocaleData(localePt);

export type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco?: number;

    imagens: string[];
    estoques: ProdutoEstoque[];

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
export class ProdutoComponent implements OnChanges {
    @Input() produto!: Produto;
    @Input() selected = false;
    @Input() disabled = false;
    @Input() compact = false;
    @Input() errors: string[] = [];

    @Output() onClickSelecionaProduto = new EventEmitter<void>();

    // Opções calculadas dinamicamente
    tamanhosDisponiveis: any[] = [];
    coresDisponiveis: any[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['produto']) {
            this.atualizarOpcoes();
        }
    }

    // Chamado pelo ngModelChange no template
    onTamanhoChange() {
        // Se mudou o tamanho, verifica se a cor selecionada ainda é válida para este tamanho
        if (this.produto.corSelecionada && this.produto.tamanhoSelecionado) {
            const existeCombinacao = this.produto.estoques.some((e) => {
                return e.tamanho && e.tamanho.id === this.produto.tamanhoSelecionado!.id &&
                    e.cor && e.cor.id === this.produto.corSelecionada!.id &&
                    e.quantidade && e.quantidade > 0;
            });

            if (!existeCombinacao) {
                this.produto.corSelecionada = null; // Reseta cor se inválida
            }
        }
        this.atualizarOpcoes();
    }

    onCorChange() {
        // Lógica inversa: se mudou a cor, valida o tamanho
        if (this.produto.tamanhoSelecionado && this.produto.corSelecionada) {
            const existeCombinacao = this.produto.estoques.some((e) => {
                return e.tamanho && e.tamanho.id === this.produto.tamanhoSelecionado!.id &&
                    e.cor && e.cor.id === this.produto.corSelecionada!.id &&
                    e.quantidade && e.quantidade > 0;
            });

            if (!existeCombinacao) {
                this.produto.tamanhoSelecionado = null;
            }
        }
        this.atualizarOpcoes();
    }

    private atualizarOpcoes() {
        if (!this.produto || !this.produto.estoques) return;

        // 1. Calcular Tamanhos Disponíveis
        // Se já tem cor selecionada, mostra tamanhos compatíveis com essa cor com qtd > 0
        // Se não tem cor, mostra todos os tamanhos que tenham estoque > 0 em qualquer cor
        const tamanhosSet = new Map<number, any>();

        this.produto.estoques.forEach((est) => {
            if (!est.quantidade || est.quantidade <= 0) return; // Ignora esgotados

            const matchCor = !this.produto.corSelecionada || !est.cor || est.cor.id === this.produto.corSelecionada.id;

            if (matchCor && est.tamanho && est.tamanho.id) {
                // Normaliza o label (pode vir como 'tamanho' ou 'label' dependendo do mapper)
                const label = est.tamanho.tamanho || String(est.tamanho.id);
                tamanhosSet.set(est.tamanho.id, { label: label, value: { id: est.tamanho.id, label } });
            }
        });

        // Ordena por Label (opcional, ajuste conforme necessidade de ordenação 'P, M, G')
        this.tamanhosDisponiveis = Array.from(tamanhosSet.values());

        // 2. Calcular Cores Disponíveis
        // Se já tem tamanho selecionado, mostra cores compatíveis com esse tamanho
        const coresSet = new Map<number, any>();

        this.produto.estoques.forEach((est) => {
            if (!est.quantidade || est.quantidade <= 0) return;

            const matchTam = !this.produto.tamanhoSelecionado || !est.tamanho || est.tamanho.id === this.produto.tamanhoSelecionado.id;

            if (matchTam && est.cor && est.cor.id) {
                const label = est.cor.nome || String(est.cor.id);
                coresSet.set(est.cor.id, { label: label, value: { id: est.cor.id, label } });
            }
        });
        this.coresDisponiveis = Array.from(coresSet.values());
    }

    onToggleClick() {
        this.onClickSelecionaProduto.emit();
    }
}
