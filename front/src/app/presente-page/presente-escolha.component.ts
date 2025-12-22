import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';

import {PresenteService} from './presente.service';
import {ProdutoComponent} from '@/presente-page/produto-component/produto-component';
import {PresenteTopbarComponent} from '@/presente-page/presente-top-bar-component/presente-top-bar-component';
import {finalize} from "rxjs";
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {EnumDescricaoPipe} from "@/shared/pipe/enum-descricao.pipe";
import {EventoEscolhaDto} from "@/shared/model/dto/evento-escolha-dto";

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
        ProdutoComponent,
        EnumDescricaoPipe
    ],
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

    // opcional: nome que pode vir por query param ?nome=Fulano
    nomeExibicao: string | null = null;

    selectedProductId: number | null = null;
    detailMode = false;
    produtos: Produto[] = [];

    // resumo retornado pelo backend
    resumo: any = null;
    podeRefazer = false;
    expirado = false;
    ultimaEscolha?: EventoEscolhaDto;
    // mensagens de feedback na tela de detalhe
    confirmError = '';
    confirmSuccess = '';
    message = "Http failure during parsing for http://localhost:8080/presente/eliseu_WPZ4FZQ5"

    get selectedProduct(): Produto | null {
        if (this.selectedProductId == null) return null;
        return this.produtos.find(p => p.id === this.selectedProductId) || null;
    }

    ngOnInit() {
        this.keyMagico = this.route.snapshot.paramMap.get('token') ?? this.route.snapshot.paramMap.get('keyMagico') ?? '';
        const produtoIdParam = this.route.snapshot.paramMap.get('produtoId');
        this.detailMode = !!produtoIdParam;
        this.selectedProductId = produtoIdParam ? Number(produtoIdParam) : null;
        this.nomeExibicao = this.route.snapshot.queryParamMap.get('nome');

        this.service.getResumo(this.keyMagico)
            .pipe(
                finalize(() => this.carregando = false)
            )
            .subscribe({
                next: (res) => {
                    this.resumo = res;
                    this.valido = true;
                    this.status = res?.eventoPessoa?.status;
                    this.podeRefazer = !!res?.podeRefazer;
                    this.expirado = !!res?.expirado;
                    this.ultimaEscolha = res?.ultimaEscolha || null;
                    this.nomeExibicao = res?.pessoaNome || this.nomeExibicao;
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
            const prod = this.produtos.find(p => p.id === this.selectedProductId!);
            if (prod) {
                const selectById = (list: any[] | undefined, idStr: string | null) => {
                    if (!list || !idStr) return null;
                    return list.find(x => x.id === Number(idStr)) || null;
                };

                const selTam = selectById(prod.tamanhos, qp.get('tamanhoId'));
                const selCor = selectById(prod.cores, qp.get('corId'));

                if (selTam) prod.tamanhoSelecionado = selTam;
                if (selCor) prod.corSelecionada = selCor;

                if (!selTam && this.ultimaEscolha?.produtoId === prod.id && this.ultimaEscolha?.tamanhoId) {
                    const tid = Number(this.ultimaEscolha.tamanhoId);
                    prod.tamanhoSelecionado = prod.tamanhos?.find(t => t.id === tid) || prod.tamanhos?.[0] || null;
                }
                if (!selCor && this.ultimaEscolha?.produtoId === prod.id && this.ultimaEscolha?.corId) {
                    const cid = Number(this.ultimaEscolha.corId);
                    prod.corSelecionada = prod.cores?.find(c => c.id === cid) || prod.cores?.[0] || null;
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
        if (Array.isArray(p.tamanhos) && p.tamanhos.length > 0 && !p.tamanhoSelecionado) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um tamanho.', life: 4000 });
            return;
        }
        if (Array.isArray(p.cores) && p.cores.length > 0 && !p.corSelecionada) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione uma cor.', life: 4000 });
            return;
        }

        const escolha = {
            evento: { id: this.resumo?.eventoId },
            pessoa: { id: this.resumo?.eventoPessoa?.pessoa?.id },
            produto: { id: p.id },
            tamanho: { id: p.tamanhoSelecionado?.id || (p.tamanhos?.[0]?.id ?? null) },
            cor: { id: p.corSelecionada?.id || (p.cores?.[0]?.id ?? null) }
        };

        if (!escolha.tamanho.id || !escolha.cor.id) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione o tamanho e a cor.', life: 4000 });
            return;
        }

        this.service.salvarEscolha(escolha).subscribe({
            next: (resp) => {
                this.ultimaEscolha = resp;
                this.detailMode = true;
                this.selectedProductId = p.id;
                this.messageService.add({ severity: 'success', summary: 'Pronto!', detail: 'Presente selecionado com sucesso.', life: 4000 });
            },
            error: (e) => {
                const msg = e?.error?.message || 'Não foi possível salvar sua escolha.';
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg, life: 5000 });
            }
        });
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
            pessoa: { id: this.resumo?.eventoPessoa?.pessoa?.id }
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

}
