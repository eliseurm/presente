import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PresenteService } from './presente.service';
import { ProdutoComponent } from '@/presente-page/produto-component/produto-component';
import { PresenteTopbarComponent } from '@/presente-page/presente-top-bar-component/presente-top-bar-component';

type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco?: number;
    tamanhos: { id: number; label: string }[];
    cores: { id: number; label: string }[];
    imagens: string[];
    tamanhoSelecionado?: { id: number; label: string } | null;
    corSelecionada?: { id: number; label: string } | null;
    _errors?: string[];
};

@Component({
    selector: 'app-presente-escolha',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ProgressSpinnerModule,
        ToastModule,
        PresenteTopbarComponent,
        ProdutoComponent
    ],
    templateUrl: './presente-escolha.component.html',
    styleUrls: ['./presente-escolha.component.scss'],
    providers: [MessageService]
})
export class PresenteEscolhaComponent {

    private route = inject(ActivatedRoute);
    private service = inject(PresenteService);
    private messageService = inject(MessageService);

    keyMagico = '';
    valido = false;
    carregando = true;
    erroMsg = '';

    // opcional: nome que pode vir por query param ?nome=Fulano
    nomeExibicao: string | null = null;

    selectedProductId: number | null = null;
    detailMode = false;
    produtos: Produto[] = [];

    // resumo retornado pelo backend
    resumo: any = null;
    podeRefazer = false;
    expirado = false;
    ultimaEscolha: any = null;
    // mensagens de feedback na tela de detalhe
    confirmError = '';
    confirmSuccess = '';

    ngOnInit() {
        // A rota pública deve ser /presente/:token (mantém compatibilidade com :keyMagico)
        this.keyMagico = this.route.snapshot.paramMap.get('token') ?? this.route.snapshot.paramMap.get('keyMagico') ?? '';
        const produtoIdParam = this.route.snapshot.paramMap.get('produtoId');
        this.detailMode = !!produtoIdParam;
        this.selectedProductId = produtoIdParam ? Number(produtoIdParam) : null;
        this.nomeExibicao = this.route.snapshot.queryParamMap.get('nome');

        this.service.getResumo(this.keyMagico)
            .then((res) => {
                this.resumo = res;
                this.valido = true;
                this.podeRefazer = !!res?.podeRefazer;
                this.expirado = !!res?.expirado;
                this.ultimaEscolha = res?.ultimaEscolha || null;
                this.nomeExibicao = res?.pessoaNome || this.nomeExibicao;
                this.produtos = (res?.produtos || []).map((p: any) => this.mapProduto(p));

                // Se já existe última escolha e não estamos explicitamente em modo refazer, abrir direto no detalhe
                if (!this.detailMode && this.ultimaEscolha?.produto?.id) {
                    const pid = Number(this.ultimaEscolha.produto.id);
                    this.irParaDetalhe(pid);
                }

                // Pré-seleciona tamanho/cor na tela de detalhe a partir de query params ou última escolha
                if (this.detailMode && this.selectedProductId) {
                    const qp = this.route.snapshot.queryParamMap;
                    const qsTam = qp.get('tamanhoId');
                    const qsCor = qp.get('corId');
                    const prod = this.produtos.find(p => p.id === this.selectedProductId!);
                    if (prod) {
                        const selectById = (list: {id:number;label:string}[]|undefined, idStr: string|null) => {
                            if (!list || !idStr) return null;
                            const id = Number(idStr);
                            return list.find(x => x.id === id) || null;
                        };
                        // Query params primeiro
                        const selTam = selectById(prod.tamanhos, qsTam);
                        const selCor = selectById(prod.cores, qsCor);
                        if (selTam) prod.tamanhoSelecionado = selTam;
                        if (selCor) prod.corSelecionada = selCor;
                        // Se não vierem params, usa última escolha (quando do mesmo produto)
                        if (!selTam && this.ultimaEscolha?.produto?.id === prod.id && this.ultimaEscolha?.tamanho?.id) {
                            const tid = Number(this.ultimaEscolha.tamanho.id);
                            prod.tamanhoSelecionado = (prod.tamanhos || []).find(t => t.id === tid) || prod.tamanhos?.[0] || null;
                        }
                        if (!selCor && this.ultimaEscolha?.produto?.id === prod.id && this.ultimaEscolha?.cor?.id) {
                            const cid = Number(this.ultimaEscolha.cor.id);
                            prod.corSelecionada = (prod.cores || []).find(c => c.id === cid) || prod.cores?.[0] || null;
                        }
                    }
                }
            })
            .catch(() => {
                this.valido = false;
                this.erroMsg = 'Este link não é válido ou não está mais ativo.';
            })
            .finally(() => (this.carregando = false));
    }

    isSelecionado(p: Produto) {
        return this.selectedProductId === p.id;
    }

    isDesabilitado(p: Produto) {
        return this.selectedProductId !== null && this.selectedProductId !== p.id;
    }

    async alternarSelecao(p: Produto) {
        // Exigir seleção explícita de tamanho/cor quando houver opções
        const precisaTam = Array.isArray(p.tamanhos) && p.tamanhos.length > 0;
        const precisaCor = Array.isArray(p.cores) && p.cores.length > 0;
        if (precisaTam && !p.tamanhoSelecionado) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um tamanho.', life: 4000 });
            return;
        }
        if (precisaCor && !p.corSelecionada) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione uma cor.', life: 4000 });
            return;
        }

        // Persistência imediata (POST /api/presente/salvar) enviando um objeto de EventoEscolha
        try {
            const escolha = {
                evento: { id: this.resumo?.eventoId },
                pessoa: { id: this.resumo?.pessoaId },
                produto: { id: p.id },
                tamanho: { id: p.tamanhoSelecionado?.id || (p.tamanhos?.[0]?.id ?? null) },
                cor: { id: p.corSelecionada?.id || (p.cores?.[0]?.id ?? null) }
            };
            if (!escolha.tamanho.id || !escolha.cor.id) {
                this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione o tamanho e a cor.', life: 4000 });
                return;
            }
            const resp = await this.service.salvarEscolha(escolha);
            this.ultimaEscolha = resp;
            // Entra no modo resumo SEM alterar a URL (link mágico permanece estável)
            this.detailMode = true;
            this.selectedProductId = p.id;
            this.messageService.add({ severity: 'success', summary: 'Pronto!', detail: 'Presente selecionado com sucesso.', life: 4000 });
        } catch (e: any) {
            const msg = e?.error?.message || 'Não foi possível salvar sua escolha.';
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg, life: 5000 });
        }
    }

    private irParaDetalhe(produtoId: number) {
        // Mantemos a URL estável; alternamos apenas o estado da tela
        this.detailMode = true;
        this.selectedProductId = produtoId;
    }

    voltarParaLista() {
        const escolha = {
            id: this.resumo?.id,
            evento: { id: this.resumo?.eventoId },
            pessoa: { id: this.resumo?.pessoaId }
        };

        this.service.limparEscolha(escolha).subscribe(() => {
            console.log("Limpesa feita!");
        });
        this.detailMode = false;
        this.selectedProductId = null;
    }

    // Confirmar não é mais necessário no fluxo novo (persistimos ao selecionar na lista).
    // Mantemos a função para compatibilidade, mas ela só valida estado atual.
    async confirmarEscolha() {
        this.messageService.add({ severity: 'info', summary: 'Informação', detail: 'Sua escolha já foi salva ao selecionar o presente.', life: 3000 });
    }

    private mapProduto(p: any): Produto {
        const tamanhos = Array.isArray(p?.tamanhos)
            ? p.tamanhos.map((t: any) => ({ id: t?.id ?? t, label: t?.tamanho ?? t?.descricao ?? String(t) }))
            : [];
        const cores = Array.isArray(p?.cores)
            ? p.cores.map((c: any) => ({ id: c?.id ?? c, label: c?.nome ?? c?.descricao ?? String(c) }))
            : [];
        const imagens = Array.isArray(p?.imagens)
            ? p.imagens.map((i: any) => this.getImagemUrl(i))
            : [];
        return {
            id: p?.id,
            nome: p?.nome,
            descricao: p?.descricao,
            preco: p?.preco,
            tamanhos,
            cores,
            imagens,
            tamanhoSelecionado: null,
            corSelecionada: null,
            _errors: []
        } as Produto;
    }

    private getImagemUrl(img: any): string {
        // Backend costuma expor imagens como objetos {id, nome,...}; arquivo disponível em /api/imagem/{id}/arquivo
        if (img && typeof img === 'object' && img.id) {
            // Usar o endpoint público sob /presente para evitar 401 por filtros de autenticação
            return `/api/presente/imagem/${img.id}/arquivo`;
        }
        // Fallback para campos diretos
        const raw: string = img?.url || img?.link || img?.src || '';
        if (!raw) return '';
        // Reescrever URLs antigas do backend no formato /imagem/{id}/arquivo para o endpoint público sob /presente
        // Mantém prefixos como /api ou domínio absoluto.
        try {
            // Ex.: https://host/api/imagem/4/arquivo  -> https://host/api/presente/imagem/4/arquivo
            //      /imagem/6/arquivo                 -> /presente/imagem/6/arquivo
            const re = /(.*?)(\/)?imagem\/(\d+)\/arquivo(.*)?$/; // captura prefixo + optional slash, id e sufixo de query
            const m = raw.match(re);
            if (m) {
                const prefix = m[1] ?? '';
                const slash = m[2] ?? '/';
                const id = m[3];
                const tail = m[4] ?? '';
                // Detecta se já existe /presente no prefixo
                if (!raw.includes('/presente/imagem/')) {
                    // Insere "/presente" após o prefixo/base
                    // Se prefixo termina com /api, preserva.
                    const newBase = prefix.endsWith('/api') ? `${prefix}` : `${prefix}`;
                    return `${newBase}/presente/imagem/${id}/arquivo${tail}`;
                }
            }
        } catch {}
        return raw;
    }

    get selectedProduct(): Produto | null {
        if (this.selectedProductId == null) return null;
        return this.produtos.find(p => p.id === this.selectedProductId) || null;
    }
}
