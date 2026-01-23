import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PresenteService } from '../presente.service';
import { ProdutoComponent } from '@/presente-page/produto-component/produto-component';
import { PresenteTopbarComponent } from '@/presente-page/presente-top-bar-component/presente-top-bar-component';
import { finalize } from 'rxjs';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { EnumDescricaoPipe } from '@/shared/pipe/enum-descricao.pipe';
import { EventoEscolhaDto } from '@/shared/model/dto/evento-escolha-dto';
import { Pessoa } from '@/shared/model/pessoa';

// Definição atualizada conforme a nova estrutura
export type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco?: number;

    imagens: string[];
    // A lista principal agora é estoques
    estoques: any[];

    tamanhoSelecionado?: { id: number; label: string } | null;
    corSelecionada?: { id: number; label: string } | null;
    _errors?: string[];
};

@Component({
    selector: 'app-presente-escolha',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ProgressSpinnerModule, ToastModule, PresenteTopbarComponent, ProdutoComponent, EnumDescricaoPipe],
    templateUrl: './presente-escolha.component.html',
    styleUrls: ['./presente-escolha.component.scss'],
    providers: [MessageService]
})
export class PresenteEscolhaComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private service = inject(PresenteService);
    private messageService = inject(MessageService);

    statusEnumType: any = StatusEnum;
    keyMagico = '';
    valido = false;
    status = 'ATIVO';
    carregando = true;
    erroMsg = '';

    pessoaExibicao?: Pessoa;

    selectedProductId: number | null = null;
    detailMode = false;
    produtos: Produto[] = [];

    resumo: any = null;
    podeRefazer = false;
    expirado = false;
    ultimaEscolha?: EventoEscolhaDto;

    confirmError = '';
    confirmSuccess = '';

    get selectedProduct(): Produto | null {
        if (this.selectedProductId == null) return null;
        return this.produtos.find((p) => p.id === this.selectedProductId) || null;
    }

    get isBloqueado(): boolean {
        // Bloqueia se estiver expirado OU se o status não for ATIVO (ex: PAUSADO, ENCERRADO, BLOQUEADO)
        return this.expirado || (this.status && this.status !== 'ATIVO') || false;
    }

    ngOnInit() {
        this.keyMagico = this.route.snapshot.paramMap.get('token') ?? this.route.snapshot.paramMap.get('keyMagico') ?? '';
        const produtoIdParam = this.route.snapshot.paramMap.get('produtoId');
        this.detailMode = !!produtoIdParam;
        this.selectedProductId = produtoIdParam ? Number(produtoIdParam) : null;
        // this.nomeExibicao = this.route.snapshot.queryParamMap.get('nome');

        this.service
            .getResumo(this.keyMagico)
            .pipe(finalize(() => (this.carregando = false)))
            .subscribe({
                next: (res) => {
                    this.resumo = res;
                    this.valido = true;
                    this.status = res?.eventoPessoa?.status;
                    this.podeRefazer = !!res?.podeRefazer;
                    this.expirado = !!res?.expirado;
                    this.ultimaEscolha = res?.ultimaEscolha || null;
                    this.pessoaExibicao = res?.eventoPessoa?.pessoa;
                    // Mapeia usando a nova lógica de estoques
                    this.produtos = (res?.produtos || []).map((p: any) => this.mapProduto(p));

                    if (!this.detailMode && this.ultimaEscolha?.produtoId) {
                        this.irParaDetalhe(Number(this.ultimaEscolha.produtoId));
                    }

                    this.processarSelecaoInicial();
                },
                error: (e) => {
                    console.error(e);
                    this.valido = false;
                    this.erroMsg = 'Este link não é válido ou não está mais ativo.';
                }
            });
    }

    private processarSelecaoInicial() {
        if (this.detailMode && this.selectedProductId) {
            const qp = this.route.snapshot.queryParamMap;
            const prod = this.produtos.find((p) => p.id === this.selectedProductId!);

            if (prod && prod.estoques) {
                // Helpers para extrair o objeto {id, label} de dentro da lista de estoques
                const findTamanhoObj = (id: number) => {
                    const stock = prod.estoques.find((s) => s.tamanho?.id === id);
                    if (stock && stock.tamanho) {
                        return { id: stock.tamanho.id, label: stock.tamanho.tamanho || String(stock.tamanho.id) };
                    }
                    return null;
                };

                const findCorObj = (id: number) => {
                    const stock = prod.estoques.find((s) => s.cor?.id === id);
                    if (stock && stock.cor) {
                        return { id: stock.cor.id, label: stock.cor.nome || String(stock.cor.id) };
                    }
                    return null;
                };

                // 1. Tenta pegar via Query Params
                const qpTamId = Number(qp.get('tamanhoId'));
                const qpCorId = Number(qp.get('corId'));

                if (qpTamId) prod.tamanhoSelecionado = findTamanhoObj(qpTamId);
                if (qpCorId) prod.corSelecionada = findCorObj(qpCorId);

                // 2. Se não veio por QP, tenta pegar da Última Escolha salva
                if (!prod.tamanhoSelecionado && this.ultimaEscolha?.produtoId === prod.id && this.ultimaEscolha?.tamanhoId) {
                    prod.tamanhoSelecionado = findTamanhoObj(Number(this.ultimaEscolha.tamanhoId));
                }

                if (!prod.corSelecionada && this.ultimaEscolha?.produtoId === prod.id && this.ultimaEscolha?.corId) {
                    prod.corSelecionada = findCorObj(Number(this.ultimaEscolha.corId));
                }
            }
        }
    }

    isSelecionado(p: Produto) {
        return this.selectedProductId === p.id;
    }

    isDesabilitado(p: Produto) {
        return this.selectedProductId !== null && this.selectedProductId !== p.id;
    }

    alternarSelecao(p: Produto) {
        // Validações de pré-seleção
        if (!p.tamanhoSelecionado) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um tamanho.', life: 4000 });
            return;
        }

        // Verifica se o produto tem opções de cores nos estoques
        if (this.hasCores(p) && !p.corSelecionada) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione uma cor.', life: 4000 });
            return;
        }

        const escolha = {
            evento: { id: this.resumo?.eventoId },
            pessoa: { id: this.resumo?.eventoPessoa?.pessoa?.id },
            produto: { id: p.id },
            tamanho: { id: p.tamanhoSelecionado?.id },
            cor: { id: p.corSelecionada?.id }
        };

        this.service.salvarEscolha(escolha).subscribe({
            next: (resp) => {
                this.ultimaEscolha = resp;
                this.detailMode = true;
                this.selectedProductId = p.id;
                this.messageService.add({ severity: 'success', summary: 'Pronto!', detail: 'Presente selecionado com sucesso.', life: 4000 });
            },
            error: (e) => {
                console.error(e);
                let msg = 'Não foi possível salvar sua escolha.';

                if (e.status === 409) {
                    msg = e.error?.message || 'Este item acabou de esgotar. A página será recarregada.';
                    setTimeout(() => window.location.reload(), 3000);
                } else if (e.error?.message) {
                    msg = e.error.message;
                }

                this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg, life: 5000 });
            }
        });
    }

    // Verifica se algum item de estoque tem cor definida
    private hasCores(p: Produto): boolean {
        return p.estoques && p.estoques.some((e) => e.cor && e.cor.id);
    }

    private mapProduto(p: any): Produto {
        const imagens = Array.isArray(p?.imagens) ? p.imagens.map((i: any) => this.getImagemUrl(i)) : [];

        // Mapeia estoques garantindo estrutura
        const estoques = Array.isArray(p?.estoques) ? p.estoques : [];

        return {
            id: p?.id,
            nome: p?.nome,
            descricao: p?.descricao,
            preco: p?.preco,
            imagens,
            estoques, // Passa a lista bruta para o componente filho filtrar e validar
            tamanhoSelecionado: null,
            corSelecionada: null,
            _errors: []
        } as Produto;
    }

    private irParaDetalhe(produtoId: number) {
        this.detailMode = true;
        this.selectedProductId = produtoId;
    }

    voltarParaLista() {
        // ATUALIZADO: Usa a nova propriedade isBloqueado
        if (this.isBloqueado) {
            let msg = 'O prazo expirou.';
            if (!this.expirado && this.status === 'PAUSADO') {
                msg = 'O evento está pausado.';
            }
            this.messageService.add({ severity: 'warn', summary: 'Ação Bloqueada', detail: `Não é possível alterar a escolha: ${msg}` });
            return;
        }

        const escolha = {
            id: this.resumo?.id,
            evento: { id: this.resumo?.eventoId },
            pessoa: { id: this.resumo?.eventoPessoa?.pessoa?.id }
        };

        this.service.limparEscolha(escolha).subscribe(() => {
            console.log('Limpeza feita!');
        });
        this.detailMode = false;
        this.selectedProductId = null;
    }


    async confirmarEscolha() {
        this.messageService.add({ severity: 'info', summary: 'Informação', detail: 'Sua escolha já foi salva ao selecionar o presente.', life: 3000 });
    }

    private getImagemUrl(img: any): string {
        if (img && typeof img === 'object' && img.id) {
            return `/api/presente/imagem/${img.id}/arquivo`;
        }
        const raw: string = img?.url || img?.link || img?.src || '';
        if (!raw) return '';
        try {
            const re = /(.*?)(\/)?imagem\/(\d+)\/arquivo(.*)?$/;
            const m = raw.match(re);
            if (m) {
                const prefix = m[1] ?? '';
                const id = m[3];
                const tail = m[4] ?? '';
                if (!raw.includes('/presente/imagem/')) {
                    const newBase = prefix.endsWith('/api') ? `${prefix}` : `${prefix}`;
                    return `${newBase}/presente/imagem/${id}/arquivo${tail}`;
                }
            }
        } catch {}
        return raw;
    }
}

