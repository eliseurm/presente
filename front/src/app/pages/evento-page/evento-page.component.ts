import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {Tabs, TabPanel, TabPanels, TabList, Tab} from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import {SelectModule} from 'primeng/select';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {DialogModule} from 'primeng/dialog';
import {TextareaModule} from 'primeng/textarea';
import {TableModule} from 'primeng/table';

import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {FilterField} from '@/shared/components/crud-filter/filter-field';
import {CrudComponent} from '@/shared/crud/crud.component';
import {CrudFilterComponent} from '@/shared/components/crud-filter/crud-filter.component';
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";

import {EventoService} from '@/services/evento.service';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {Pessoa} from '@/shared/model/pessoa';
import {Produto} from '@/shared/model/produto';
import {Cliente} from '@/shared/model/cliente';
import {StatusEnum} from '@/shared/model/enum/status.enum';
import {EventoCrudVM} from './evento-crud.vm';
import {Router} from '@angular/router';
import {PessoaService} from '@/services/pessoa.service';
import {ProdutoService} from '@/services/produto.service';
import {ClienteService} from '@/services/cliente.service';
import { environment } from '../../../environments/environment';
import {
    ErmColumnComponent,
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmPopupComponent,
    ErmTemplateDirective,
    ErmValidationRuleComponent
} from '@/shared/components/erm-data-grid';

@Component({
    selector: 'evento-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        DialogModule,
        SelectModule,
        TextareaModule,
        Tabs,
        TabPanel,
        TabPanels,
        TabList,
        Tab,
        DatePickerModule,
        EnumSelectComponent,
        CrudFilterComponent,
        CrudComponent,
        TableModule,
        ErmDataGridComponent,
        ErmEditingComponent,
        ErmPopupComponent,
        ErmFormComponent,
        ErmItemComponent,
        ErmColumnComponent,
        ErmValidationRuleComponent,
        ErmTemplateDirective,
        AutoCompleteModule
    ],
    templateUrl: './evento-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss'
    ],
    providers: [MessageService, EventoCrudVM]
})
@CrudMetadata("EventoPageComponent", [Evento, EventoFilter])
export class EventoPageComponent implements OnInit {

    @ViewChild('crudRef') crudRef?: CrudComponent<Evento, EventoFilter>;

    // Opções
    clientesOptions: Cliente[] = [];
    produtosOptions: Produto[] = [];
    statusEnumType: any = StatusEnum;

    // Sugestões para Autocomplete
    pessoasSugestoes: Pessoa[] = [];
    produtosSugestoes: Produto[] = [];
    carregandoPessoas = false;
    carregandoProdutos = false;

    filterFields: FilterField[] = [
        { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
        { key: 'clienteId', label: 'Cliente', type: 'select', options: [] },
        { key: 'status', label: 'Status', type: 'select', options: (Object.values(StatusEnum) as any[]).map((s: any) => ({ label: String(s.descricao ?? s.key), value: s.key })) }
    ];

    constructor(
        public vm: EventoCrudVM,
        private eventoService: EventoService,
        private pessoaService: PessoaService,
        private produtoService: ProdutoService,
        private clienteService: ClienteService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.vm.init();
        // Hotfix: não usar expand no carregamento do evento para evitar 500 no backend.
        // O backend já inicializa pessoas/produtos em buscarPorId() dentro da transação.
        // Quando o modelo é recarregado (abrir edição, salvar, etc.), atualiza labels auxiliares
        this.vm.refreshModel.subscribe(() => this.preencherCamposDeExibicao());
        this.carregarOpcoes();
    }

    private carregarOpcoes(): void {
        const base: any = { page: 0, size: 9999, sort: 'id', direction: 'ASC' };
        // Carrega somente os clientes vinculados ao usuário (evita 403 para CLIENTE)
        this.clienteService.getMe().subscribe({
            next: (clientes) => {
            this.clientesOptions = clientes || [];
            // Se houver apenas um cliente, auto-seleciona no filtro
            if (this.clientesOptions.length === 1) {
                const unico = this.clientesOptions[0];
                if (unico?.id) {
                    (this.vm.filter as any).clienteId = unico.id;
                    // Predefine também no modelo para criação/edição mantendo OBJETO completo
                    if (!(this.vm.model as any)?.cliente) {
                        (this.vm.model as any).cliente = unico; // manter objeto completo
                    }
                    // Dispara uma filtragem inicial já com clienteId para evitar 403
                    try { this.vm.doFilter().subscribe(); } catch {}
                }
            }

            // Atualiza opções do filtro Cliente
            const idx = this.filterFields.findIndex(f => f.key === 'clienteId');
            if (idx >= 0) {
                this.filterFields[idx] = {
                    ...this.filterFields[idx],
                    options: this.clientesOptions.map(c => ({ label: c?.nome ?? String(c?.id ?? ''), value: c?.id }))
                };
            }
            this.preencherCamposDeExibicao();
        },
            error: _ => {
            // 403 aqui indicará que o token não possui papel/escopo; mostrar aviso
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar seus clientes (acesso negado).' });
        }});

        // Pessoas: não listar globalmente para evitar 403 para CLIENTE; serão buscadas via lookup no autocomplete
        this.produtoService.listar(base).subscribe({
            next: page => {
                this.produtosOptions = page.content || [];
                this.preencherCamposDeExibicao();
            },
            error: _ => {
            // Produtos não são críticos para o carregamento inicial
            this.produtosOptions = [];
            }
        });
    }

    onPage(event: any) {
        this.vm.filter.page = event.page;
        this.vm.filter.size = event.rows;
        this.vm.doFilter().subscribe({
            error: (err) => this.handleListError(err)
        });
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
        // Preserva clienteId se houver apenas um cliente disponível
        if (this.clientesOptions && this.clientesOptions.length === 1) {
            const unico = this.clientesOptions[0];
            if (unico?.id) (this.vm.filter as any).clienteId = unico.id;
        }
        this.vm.doFilter().subscribe({
            error: (err) => this.handleListError(err)
        });
    }

    onCloseCrud() {
        this.router.navigate(['/']);
    }

    onSearchClick() {
        // Dispara a busca com tratamento de erro (evita erro silencioso/console apenas)
        this.vm.doFilter().subscribe({
            error: (err) => this.handleListError(err)
        });
    }

    private handleListError(err: any) {
        const status = err?.status;
        if (status === 401 || status === 403) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acesso restrito',
                detail: 'Selecione um cliente para buscar os eventos ou verifique suas permissões.'
            });
            return;
        }
        const msg = err?.error?.message || 'Não foi possível carregar a lista de eventos.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
    }

    getStatusDescricao(status: any): string {
        if (!status) return '';
        if (typeof status === 'string') {
            const found = (Object.values(StatusEnum) as any[]).find((s: any) => s.key === status || (s.descricao || '').toLowerCase() === status.toLowerCase());
            return found?.descricao || status;
        }
        if (typeof status === 'object') {
            return (status as any).descricao || (status as any).key || '';
        }
        return '';
    }

    // ================= Ações: Iniciar / Parar Evento =================
    onIniciarEvento() {
        const id = this.vm.model?.id;
        if (!id) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Grave o evento antes de iniciar.'});
            return;
        }
        const baseUrl = this.getPublicBaseUrl();
        this.eventoService.iniciarEvento(id as number, baseUrl).subscribe({
            next: (res) => {
                const n = res?.gerados ?? 0;
                this.messageService.add({severity:'success', summary:'Evento iniciado', detail:`${n} link(s) gerados`});
                // Recarrega o evento para refletir tokens e datas
                this.vm.onIdParam(String(id));
            },
            error: (err) => {
                const msg = err?.error?.message || 'Falha ao iniciar o evento.';
                this.messageService.add({severity:'error', summary:'Erro', detail: msg});
            }
        });
    }

    onPararEvento() {
        const id = this.vm.model?.id;
        if (!id) return;
        this.eventoService.pararEvento(id as number).subscribe({
            next: (res) => {
                const n = res?.pausados ?? 0;
                this.messageService.add({severity:'success', summary:'Evento pausado', detail:`${n} pessoa(s) pausadas`});
                this.vm.onIdParam(String(id));
            },
            error: () => this.messageService.add({severity:'error', summary:'Erro', detail:'Falha ao parar o evento.'})
        });
    }

    private getPublicBaseUrl(): string {
        // Deriva a base pública removendo sufixo /api da environment.apiUrl
        const api = environment.apiUrl || '';
        return api.replace(/\/+api\/?$/, '');
    }

    buildTokenLink(token?: string): string {
        if (!token) return '#';
        return `${this.getPublicBaseUrl()}/presente/${encodeURIComponent(token)}`;
    }

    abrirPresente(token?: string) {
        if (!token) return;
        const url = this.buildTokenLink(token);
        window.open(url, '_blank', 'noopener');
    }

    async copiarLink(token?: string) {
        if (!token) return;
        const url = this.buildTokenLink(token);
        try {
            await navigator.clipboard.writeText(url);
            this.messageService.add({severity:'info', summary:'Copiado', detail:'Link copiado para a área de transferência'});
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch {}
            document.body.removeChild(ta);
            this.messageService.add({severity:'info', summary:'Copiado', detail:'Link copiado para a área de transferência'});
        }
    }

    // Rótulos de exibição nas células da grid, evitando [object Object]
    getPessoaRotulo(row: any): string {
        if (!row || typeof row.pessoa !== 'object') return '';
        return row.pessoa.nome;
    }

    getProdutoRotulo(row: any): string {
        if (!row) return '';
        if (row.produtoNome) return row.produtoNome;
        const id = typeof row.produto === 'object' ? row.produto?.id : row.produto;
        const obj = this.produtosOptions.find(p => p.id === id);
        return obj?.nome || (id != null ? String(id) : '');
    }

    // ======= Handlers para ERM Data Grid nas abas =======
    onInitNewPessoa(event: any) {
        event.data = event.data || {};
        // Campo apenas para o editor (AutoComplete)
        event.data._pessoaObj = null;
        // Campo persistido (ID): manteremos apenas o ID ao salvar
        event.data.pessoa = null;
        event.data.status = null;
        // Garante a aba inicial no popup
        event.data._tab = 'geral';
    }

    // Busca remota de pessoas (lookup escopado)
    searchPessoas(event: any) {
        const query = (event?.query || '').trim();
        this.carregandoPessoas = true;
        // Determina clienteId atual (filtro > modelo)
        let clienteId: number | undefined = (this.vm.filter as any)?.clienteId;
        const mc = (this.vm.model as any)?.cliente;
        if (!clienteId && mc) {
            if (typeof mc === 'object') clienteId = mc.id ?? undefined;
            if (typeof mc === 'number') clienteId = mc;
        }
        this.pessoaService.lookup(query || undefined, clienteId).subscribe({
            next: list => {
                this.pessoasSugestoes = list || [];
                this.carregandoPessoas = false;
            },
            error: _ => {
                this.pessoasSugestoes = [];
                this.carregandoPessoas = false;
            }
        });
    }

    onSavingPessoa(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.pessoas) this.vm.model.pessoas = [];
        // Objeto selecionado no AutoComplete e ID
        const selected = row._pessoaObj ?? row.pessoa;
        const pessoaId = typeof selected === 'object' ? selected?.id : selected;
        if (!pessoaId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione a Pessoa'});
            event.cancel = true;
            return;
        }
        // Normaliza status para valor serializável ao backend (enum string)
        if (row.status && typeof row.status === 'object') {
            row.status = (row.status as any).key ?? (row.status as any).name ?? row.status;
        }
        // Evita duplicidade
        const duplicate = this.vm.model.pessoas.some((p:any) => (p?.pessoa?.id || p?.pessoa) === pessoaId && p !== row);
        if (duplicate) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Essa pessoa já está na lista.'});
            event.cancel = true;
            return;
        }
        // Normaliza campos para exibição/persistência
        this.messageService.add({severity:'success', summary:'OK', detail:'Pessoa registrada na lista do evento (pendente de Gravar).'});
    }

    onDeletingPessoa(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.pessoas) return;
        const pessoaId = typeof row.pessoa === 'object' ? row.pessoa?.id : row.pessoa;
        this.vm.model.pessoas = this.vm.model.pessoas.filter((p:any) => (p?.pessoa?.id || p?.pessoa) !== pessoaId);
        this.messageService.add({severity:'success', summary:'OK', detail:'Pessoa removida da lista (pendente de Gravar).'});
    }

    onInitNewProduto(event: any) {
        event.data = event.data || {};
        event.data._produtoObj = null; // usado apenas no editor (AutoComplete)
        event.data.produto = null;     // manteremos apenas o ID ao salvar
        event.data.status = null;
    }

    // Busca remota de produtos para o Autocomplete
    searchProdutos(event: any) {
        const query = (event?.query || '').trim();
        const filtro: any = {
            nome: query || undefined,
            page: 0,
            size: 10,
            sort: 'nome',
            direction: 'ASC'
        };
        this.carregandoProdutos = true;
        this.produtoService.listar(filtro).subscribe({
            next: page => {
                this.produtosSugestoes = page?.content || [];
                this.carregandoProdutos = false;
            },
            error: _ => {
                this.produtosSugestoes = [];
                this.carregandoProdutos = false;
            }
        });
    }

    onSavingProduto(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.produtos) this.vm.model.produtos = [];
        const selected = row._produtoObj ?? row.produto;
        const produtoId = typeof selected === 'object' ? selected?.id : selected;
        if (!produtoId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione o Produto'});
            event.cancel = true;
            return;
        }
        // Normaliza status para valor serializável ao backend (enum string)
        if (row.status && typeof row.status === 'object') {
            row.status = (row.status as any).key ?? (row.status as any).name ?? row.status;
        }
        const duplicate = this.vm.model.produtos.some((pr:any) => (pr?.produto?.id || pr?.produto) === produtoId && pr !== row);
        if (duplicate) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Esse produto já está na lista.'});
            event.cancel = true;
            return;
        }
        const produtoObj = typeof selected === 'object' ? selected : (this.produtosSugestoes.find(p => p.id === produtoId) || this.produtosOptions.find(p => p.id === produtoId));
        row.produto = produtoId; // mantém ID
        row.produtoNome = produtoObj?.nome || String(produtoId);
        this.messageService.add({severity:'success', summary:'OK', detail:'Produto registrado na lista do evento (pendente de Gravar).'});
    }

    // Hidrata o AutoComplete ao iniciar edição de uma linha existente (Pessoa)
    onEditingStartPessoa(event: any) {
        const row: any = event?.data || {};
        // Garante que o Status apareça selecionado no enum-select do popup
        row.status = this.getStatusOption(row.status);
        // Define a aba inicial do popup como 'geral' (tabs headless)
        row._tab = 'geral';

        // Carrega última escolha e histórico da pessoa nesta aba
        try {
            const eventoId = this.vm.model?.id;
            const pessoaId = typeof row?.pessoa === 'object' ? row.pessoa?.id : row?.pessoa;
            if (!eventoId || !pessoaId) return;
            this.pessoaEscolhaLoading = true;
            this.pessoaUltimaEscolha = null as any;
            this.pessoaHistorico = [] as any[];
            this.eventoService.getUltimaEscolha(eventoId as number, pessoaId as number).subscribe({
                next: (e) => this.pessoaUltimaEscolha = e,
                error: () => this.pessoaUltimaEscolha = null
            });
            this.eventoService.getHistoricoEscolhas(eventoId as number, pessoaId as number).subscribe({
                next: (list) => this.pessoaHistorico = list || [],
                error: () => this.pessoaHistorico = []
            });
        } finally {
            setTimeout(() => this.pessoaEscolhaLoading = false, 300);
        }
    }

    // Hidrata o AutoComplete ao iniciar edição de uma linha existente (Produto)
    onEditingStartProduto(event: any) {
        const row: any = event?.data || {};
        // Garante que o Status apareça selecionado no enum-select do popup
        row.status = this.getStatusOption(row.status);
        const id = typeof row?.produto === 'object' ? row.produto?.id : row?.produto;
        if (!id) {
            row._produtoObj = null;
            row.produto = null;
            return;
        }
        const cached = this.produtosOptions.find(p => p.id === id);
        if (cached) {
            row._produtoObj = cached;
            row.produto = cached.id;
            row.produtoNome = cached.nome;
            return;
        }
        try {
            this.produtoService.getById(id).subscribe({
                next: (p) => { row._produtoObj = p; row.produto = p?.id; row.produtoNome = p?.nome; },
                error: () => { const tmp = { id, nome: row?.produtoNome || String(id) } as any; row._produtoObj = tmp; row.produto = id; row.produtoNome = tmp.nome; }
            });
        } catch {
            const tmp = { id, nome: row?.produtoNome || String(id) } as any;
            row._produtoObj = tmp;
            row.produto = id;
            row.produtoNome = tmp.nome;
        }
    }

    // Sincronização imediata ao selecionar/limpar no AutoComplete (Pessoa)
    onPessoaSelecionada(row: any, event: any) {
        try {
            const item = event?.value ?? row?._pessoaObj;
            row._pessoaObj = item;
            row.pessoa = item?.id ?? null;
        } catch {}
    }
    onPessoaLimpar(row: any) {
        row._pessoaObj = null;
        row.pessoa = null;
    }

    // Sincronização imediata ao selecionar/limpar no AutoComplete (Produto)
    onProdutoSelecionado(row: any, event: any) {
        try {
            const item = event?.value ?? row?._produtoObj;
            row._produtoObj = item;
            row.produto = item?.id ?? null;
            row.produtoNome = item?.nome ?? '';
        } catch {}
    }
    onProdutoLimpar(row: any) {
        row._produtoObj = null;
        row.produto = null;
        row.produtoNome = '';
    }

    // Preenche labels auxiliares para exibição na grid
    private preencherCamposDeExibicao(): void {
        try {
            if (this.vm.model) {
                // Mantém cliente como objeto completo; para datas, converte para Date (necessário ao p-datepicker)
                this.vm.model.inicio = this.toDateOrNull(this.vm.model.inicio) as any;
                this.vm.model.fimPrevisto = this.toDateOrNull(this.vm.model.fimPrevisto) as any;
                this.vm.model.fim = this.toDateOrNull(this.vm.model.fim) as any;
                // Se cliente vier como ID por alguma chamada antiga, tenta casar com opções para transformar em objeto
                const cli: any = (this.vm.model as any).cliente;
                if (cli && typeof cli !== 'object') {
                    const match = this.clientesOptions.find(c => c.id === cli);
                    if (match) {
                        (this.vm.model as any).cliente = match;
                    }
                }
            }
        } catch {}
    }

    onDeletingProduto(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.produtos) return;
        const produtoId = typeof row.produto === 'object' ? row.produto?.id : row.produto;
        this.vm.model.produtos = this.vm.model.produtos.filter((pr:any) => (pr?.produto?.id || pr?.produto) !== produtoId);
        this.messageService.add({severity:'success', summary:'OK', detail:'Produto removido da lista (pendente de Gravar).'});
    }

    private toDateOrNull(val: string | Date | null | undefined): Date | null {
        if (!val) return null;
        if (val instanceof Date) return val;
        const str = String(val);
        // aceita formatos ISO com minutos
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    // Converte valor de status (string | objeto | null) na opção esperada pelo enum-select
    private getStatusOption(val: any): any {
        if (!val) return null;
        // Se já for um objeto com 'key' ou 'descricao', mantém
        if (typeof val === 'object') return val;
        // Caso seja string, procura a opção correspondente em StatusEnum
        try {
            const options = Object.values(this.statusEnumType) as any[];
            const lower = String(val).toLowerCase();
            const found = options.find(opt => String(opt?.key ?? opt?.name ?? '').toLowerCase() === lower || String(opt?.descricao ?? '').toLowerCase() === lower);
            return found || val;
        } catch {
            return val;
        }
    }

    // Limpa campos de data da aba Geral
    clearDate(field: 'inicio' | 'fimPrevisto' | 'fim'): void {
        if (!this.vm?.model) return;
        (this.vm.model as any)[field] = null;
    }

    // ======= Estado do popup: escolha/histórico =======
    pessoaEscolhaLoading = false;
    pessoaUltimaEscolha: any = null;
    pessoaHistorico: any[] = [];
}

// Helpers de exibição (espaço reservado)
