import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { PresenteService } from './presente.service';
import { ProdutoComponent } from '@/presente-page/produto-component/produto-component';
import { PresenteTopbarComponent } from '@/presente-page/presente-top-bar-component/presente-top-bar-component';

type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    tamanhos: string[];
    imagens: string[];
    tamanhoSelecionado?: string | null;
};

@Component({
    selector: 'app-presente-escolha',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ProgressSpinnerModule,
        PresenteTopbarComponent,
        ProdutoComponent
    ],
    templateUrl: './presente-escolha.component.html',
    styleUrls: ['./presente-escolha.component.scss']
})
export class PresenteEscolhaComponent {
    private route = inject(ActivatedRoute);
    private service = inject(PresenteService);

    keyMagico = '';
    valido = false;
    carregando = true;
    erroMsg = '';

    // opcional: nome que pode vir por query param ?nome=Fulano
    nomeExibicao: string | null = null;

    selectedProductId: number | null = null;

    produtos: Produto[] = [
        { id: 1, nome: 'Caneca personalizada', descricao: 'Caneca de cerâmica 350ml com estampa exclusiva.', preco: 69.9, tamanhos: ['P', 'M', 'G'], imagens: ['https://picsum.photos/seed/caneca-1/800/600', 'https://picsum.photos/seed/caneca-2/800/600', 'https://picsum.photos/seed/caneca-3/800/600'] },
        { id: 2, nome: 'Camisa do time', descricao: 'Camisa oficial, tecido dry-fit, edição 2025.', preco: 249.0, tamanhos: ['PP', 'P', 'M', 'G', 'GG'], imagens: ['https://picsum.photos/seed/camisa-1/800/600', 'https://picsum.photos/seed/camisa-2/800/600'] },
        { id: 3, nome: 'Kit de chocolates', descricao: 'Seleção premium de chocolates artesanais.', preco: 119.5, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/choc-1/800/600', 'https://picsum.photos/seed/choc-2/800/600'] },
        { id: 4, nome: 'Mochila urbana', descricao: 'Mochila resistente, compartimento para notebook.', preco: 199.9, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/mochila-1/800/600', 'https://picsum.photos/seed/mochila-2/800/600'] },
        { id: 5, nome: 'Fone Bluetooth', descricao: 'Cancelamento de ruído e bateria de longa duração.', preco: 329.0, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/fone-1/800/600', 'https://picsum.photos/seed/fone-2/800/600'] },
        { id: 6, nome: 'Garrafa térmica', descricao: 'Aço inox 750ml, mantém gelado por 24h.', preco: 99.0, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/garrafa-1/800/600', 'https://picsum.photos/seed/garrafa-2/800/600'] },
        { id: 7, nome: 'Jaqueta corta-vento', descricao: 'Leve, compacta e resistente à água.', preco: 279.9, tamanhos: ['P', 'M', 'G', 'GG'], imagens: ['https://picsum.photos/seed/jaqueta-1/800/600', 'https://picsum.photos/seed/jaqueta-2/800/600'] },
        { id: 8, nome: 'Tênis casual', descricao: 'Conforto para o dia a dia, solado em EVA.', preco: 349.0, tamanhos: ['37', '38', '39', '40', '41', '42', '43'], imagens: ['https://picsum.photos/seed/tenis-1/800/600', 'https://picsum.photos/seed/tenis-2/800/600', 'https://picsum.photos/seed/tenis-3/800/600'] },
        { id: 9, nome: 'Relógio esportivo', descricao: 'Monitoramento de atividades e notificações.', preco: 459.0, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/relogio-1/800/600', 'https://picsum.photos/seed/relogio-2/800/600'] },
        { id: 10, nome: 'Óculos de sol', descricao: 'Lentes UV400 com proteção total.', preco: 189.0, tamanhos: ['Único'], imagens: ['https://picsum.photos/seed/oculos-1/800/600', 'https://picsum.photos/seed/oculos-2/800/600'] }
    ];

    ngOnInit() {
        this.keyMagico = this.route.snapshot.paramMap.get('keyMagico') ?? '';
        this.nomeExibicao = this.route.snapshot.queryParamMap.get('nome');

        this.service
            .validarKey(this.keyMagico)
            .then((ok) => {
                this.valido = ok;
                if (!ok) this.erroMsg = 'Este link não é válido ou não está mais ativo.';
            })
            .catch(() => {
                this.valido = false;
                this.erroMsg = 'Não foi possível validar o link agora.';
            })
            .finally(() => (this.carregando = false));
    }

    isSelecionado(p: Produto) {
        return this.selectedProductId === p.id;
    }

    isDesabilitado(p: Produto) {
        return this.selectedProductId !== null && this.selectedProductId !== p.id;
    }

    alternarSelecao(p: Produto) {
        this.selectedProductId = this.isSelecionado(p) ? null : p.id;
    }
}
