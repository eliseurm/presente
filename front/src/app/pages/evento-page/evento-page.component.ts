import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {DatePickerModule} from 'primeng/datepicker';
import {SelectFilterEvent, SelectModule} from 'primeng/select';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {DialogModule} from 'primeng/dialog';
import {TextareaModule} from 'primeng/textarea';
import {TableModule} from 'primeng/table';
import {ListboxModule} from 'primeng/listbox';

import {CrudMetadata} from '@/shared/core/crud.metadata.decorator';
import {FilterField} from '@/shared/components/crud-filter/filter-field';
import {CrudComponent} from '@/shared/crud/crud.component';
import {CrudFilterComponent} from '@/shared/components/crud-filter/crud-filter.component';
import {EnumSelectComponent} from '@/shared/components/enum-select/enum-select.component';
import {CrudBaseComponent} from '@/shared/components/crud-base/crud-base.component';
import {
    EDataGridComponent,
    EiColumnComponent, EiItemComponent, EiValidationRuleComponent,
    EoEditingComponent,
    EoFormComponent,
    EPopupComponent,
    ETemplateDirective
} from '@/shared/components/e-data-grid';

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
import {EventoEscolhaDto} from '@/shared/model/dto/evento-escolha-dto';
import {debounceTime, distinctUntilChanged, forkJoin, Subject} from 'rxjs';
import {ProdutoFilter} from '@/shared/model/filter/produto-filter';
import {ProdutoMapper} from '@/shared/model/mapper/produto-mapper';
import {EventoProduto} from '@/shared/model/evento-produto';
import {PessoaFilter} from '@/shared/model/filter/pessoa-filter';
import {Paginator} from "primeng/paginator";
import {filter} from "rxjs/operators";
import {EventoPessoaFilter} from "@/shared/model/filter/evento-pessoa-filter";
import {EventoPessoa} from "@/shared/model/evento-pessoa"; // Certifique-se que este arquivo existe

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
        EDataGridComponent,
        EoEditingComponent,
        EPopupComponent,
        EoFormComponent,
        EiColumnComponent,
        ETemplateDirective,
        AutoCompleteModule,
        ListboxModule,
        EiValidationRuleComponent,
        EiItemComponent,
        Paginator
    ],
    templateUrl: './evento-page.component.html',
    styleUrls: ['./evento-page.component.scss', '../../shared/components/crud-base/crud-base.component.scss'],
    providers: [MessageService, EventoCrudVM]
})
@CrudMetadata('EventoPageComponent', [Evento, EventoFilter])
export class EventoPageComponent extends CrudBaseComponent<Evento, EventoFilter> {

    // Opções Gerais
    clientesOptions: Cliente[] = [];
    statusEnumType: any = StatusEnum;
    abasVisitadas = new Set<string>();
    abaAtiva: string = 'geral';

    // ======= Grid Paginada (Lazy Load) =======
    // listaPessoasPaginada: any[] = [];
    // totalPessoas: number = 0;
    loadingPessoas: boolean = false;

    pessoasGridDisplay: any[] = [];
    filterEventoPessoa: EventoPessoaFilter = new EventoPessoaFilter();
    private filterSearchSubject = new Subject<void>();

    // ======= Sugestões para Selects =======
    pessoasSugestoes: Pessoa[] = [];
    produtosSugestoes: Produto[] = [];
    filtroProduto: ProdutoFilter = new ProdutoFilter();

    // ======= Estado do Popup: Escolha/Histórico =======
    pessoaEscolhaLoading = false;
    pessoaUltimaEscolha: any = null;
    pessoaHistorico: EventoEscolhaDto[] = [];

    // ======= Popup Custom de Adição de Pessoas =======
    addPessoasDialogVisible = false;
    pessoasPossiveis: Pessoa[] = [];
    pessoasSelecionadas: Pessoa[] = [];
    statusSelecionado: any = null;

    // ======= Controles de Importação e Logs =======
    importando: boolean = false;
    importacaoLogs: string[] = [];

    readonly filterFields: FilterField[] = [
        { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
        { key: 'clienteId', label: 'Cliente', type: 'select', options: [] },
        {key: 'status', label: 'Status', type: 'enum', placeholder: 'Selecione o status', enumObject: StatusEnum, optionLabel: 'descricao'}    ];

    constructor(
        messageService: MessageService,
        vm: EventoCrudVM,
        private eventoService: EventoService,
        private pessoaService: PessoaService,
        private produtoService: ProdutoService,
        private clienteService: ClienteService,
        private router: Router
    ) {
        super(messageService, vm);
    }

    protected get abstractVM(): EventoCrudVM {
        return this.vm as EventoCrudVM;
    }

    override ngOnInit(): void {
        this.vm.init();

        // Inicializa paginação padrão
        this.filterEventoPessoa.page = 0;
        this.filterEventoPessoa.size = 10;

        // Configure um timer para o filtro de eventoPessoas
        this.filterSearchSubject.pipe(
            debounceTime(2000)
        ).subscribe(() => {
            this.filtrarPessoasLocalmente(); // Chama sua função de filtro
        });

        this.vm.refreshModel.subscribe(() => {
            this.preencherCamposDeExibicao();
            // Carrega a primeira página da grid ao abrir o evento
            this.buscarPessoasDoBackend();
        });
        this.carregarOpcoes();
    }

    // =========================================================================
    //  IMPORTAÇÃO CSV
    // =========================================================================
    onFileSelect(event: any) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const eventoId = this.vm.model?.id;

            if (!eventoId) {
                this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Salve o evento antes de importar.' });
                return;
            }

            this.importando = true;
            this.importacaoLogs = [];

            this.eventoService.importarPessoasCsv(eventoId, file).subscribe({
                next: (res: any) => {
                    this.importando = false;
                    const adicionados = res?.adicionados ?? 0;
                    const logs = res?.logErros ?? [];

                    if (adicionados > 0) {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${adicionados} pessoas importadas.` });
                        this.onRefreshGridPessoas(); // Recarrega do backend
                    } else if (logs.length === 0) {
                        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Nenhuma pessoa nova foi adicionada.' });
                    }

                    if (logs.length > 0) {
                        this.importacaoLogs = logs;
                        this.abaAtiva = 'log'; // Troca aba para mostrar erro
                        this.messageService.add({ severity: 'error', summary: 'Erros na Importação', detail: 'Verifique a aba de Log.' });
                    }

                    input.value = '';
                },
                error: (err) => {
                    this.importando = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro Fatal',
                        detail: err?.error?.message || 'Falha ao enviar arquivo.'
                    });
                    input.value = '';
                }
            });
        }
    }

    limparLogs() {
        this.importacaoLogs = [];
        this.abaAtiva = 'pessoa';
    }

    // =========================================================================
    //  GRID PESSOAS: FILTRO E PAGINAÇÃO (SERVER-SIDE)
    // =========================================================================

    // Chamado pela Grid automaticamente (paginação, ordenação)
/*
    onLazyLoadPessoas(event: any) {
        if(!this.vm.model.id) return;

        const page = Math.floor((event.first || 0) / (event.rows || 10));
        const size = event.rows || 10;

        this.filterEventoPessoa.page = page;
        this.filterEventoPessoa.size = size;

        this.buscarPessoasDoBackend();
    }

    filtrarPessoasBackend() {
        this.filterEventoPessoa.page = 0; // Volta para 1ª página na nova busca
        this.buscarPessoasDoBackend();
    }
*/


    // Chamado pelos inputs de texto (Nome/CPF)
    filtrarPessoasLocalmente() {
        let lista: EventoPessoa[] = this.vm.model.eventoPessoas || [];

        const nomeBusca = this.filterEventoPessoa.pessoaNome?.toLowerCase();
        const cpfBusca = this.filterEventoPessoa.pessoaCpf?.replace(/\D/g, ''); // remove mascara se houver

        if (nomeBusca) {
            lista = lista.filter(item => {
                // Ajuste 'pessoa.nome' conforme sua estrutura (item.pessoa.nome ou item.nome)
                const nome = (item.pessoa?.nome || '').toLowerCase();
                return nome.includes(nomeBusca);
            });
        }

        if (cpfBusca) {
            lista = lista.filter(item => {
                const cpf = (item.pessoa?.cpf || '').replace(/\D/g, '');
                return cpf.includes(cpfBusca);
            });
        }

        // Atualiza a variável que a Grid está lendo
        this.pessoasGridDisplay = lista;

        // Atualiza contador visual
        this.filterEventoPessoa.totalItens = this.pessoasGridDisplay.length;
    }

    // Executa a busca na API
    buscarPessoasDoBackend() {
        this.loadingPessoas = true;
        this.filterEventoPessoa.eventoId = this.vm.model?.id;
        this.filterEventoPessoa.size = -1; // Traz tudo
        this.filterEventoPessoa.order = ['pessoa.nome,asc'];

        this.eventoService.listEventoPessoaPaginado(this.filterEventoPessoa).subscribe({
            next: (pageData: any) => {
                if (this.vm.model) {
                    this.vm.model.eventoPessoas = pageData.content || [];
                }
                this.filterEventoPessoa.totalItens = pageData.page.totalElements || 0;

                this.filtrarPessoasLocalmente();

                this.loadingPessoas = false;
            },
            error: (err) => {
                this.loadingPessoas = false;
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar pessoas.' });
            }
        });

/*
        this.eventoService.listEventoPessoa(this.filterEventoPessoa).subscribe({
            next: (pageData: any) => {
                if (this.vm.model) {
                    this.vm.model.eventoPessoas = pageData.content || [];
                }
                this.filterEventoPessoa.totalItens = pageData.page.totalElements || 0;

                this.loadingPessoas = false;
            },
            error: (err) => {
                this.loadingPessoas = false;
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar as pessoas.' });
            }
        });
*/
    }

    onRefreshGridPessoas(): void {
        this.buscarPessoasDoBackend();
    }

    // =========================================================================
    //  CRUD PESSOA (ADICIONAR/EDITAR/REMOVER)
    // =========================================================================

    onOpenAddPessoas() {
        this.pessoasSelecionadas = [];
        let clienteId: number | undefined = (this.vm.filter as any)?.clienteId;
        const mc = (this.vm.model as any)?.cliente;
        if (!clienteId && mc) {
            if (typeof mc === 'object') clienteId = mc.id ?? undefined;
            if (typeof mc === 'number') clienteId = mc;
        }
        if (!clienteId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Selecione um Cliente antes de adicionar pessoas.'
            });
            return;
        }

        // Carrega lista para o popup de adição
        this.pessoaService.findPessoaPorCliente(clienteId).subscribe({
            next: (list) => {
                // Filtra visualmente quem já está na PÁGINA ATUAL (limitação do lazy, mas ajuda)
                const jaIds = new Set((this.vm.model.eventoPessoas || []).map((p: any) => (typeof p.pessoa === 'object' ? p.pessoa?.id : p.pessoa)));
                this.pessoasPossiveis = (list || []).filter((p) => !jaIds.has(p.id));
                this.addPessoasDialogVisible = true;
            },
            error: (_) => {
                this.pessoasPossiveis = [];
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as pessoas disponíveis.' });
            }
        });
    }

    onCancelAddPessoas() {
        this.addPessoasDialogVisible = false;
        this.pessoasSelecionadas = [];
    }

    onConfirmAddPessoas() {
        const selecionados = this.pessoasSelecionadas || [];
        if (!selecionados.length) return;

        let status = this.statusSelecionado;
        if (status && typeof status === 'object') {
            status = status.key ?? status.name ?? status;
        }
        if (!status) {
            this.messageToastAddAndShow('Selecione o Status', 'Atenção', 'warn');
            return;
        }

        const eventoId = this.vm.model.id;
        // Chama API para adicionar um a um
        const observables = selecionados.map((p) => {
            if (eventoId != null && p.id != null) {
                this.eventoService.addOrUpdatePessoa(eventoId, p.id, status);
            }
        });

        forkJoin(observables).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Adicionado', detail: `${selecionados.length} pessoas adicionadas.` });
                this.addPessoasDialogVisible = false;
                this.pessoasSelecionadas = [];
                this.buscarPessoasDoBackend(); // Recarrega grid do servidor
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar algumas pessoas.' });
            }
        });
    }

    onSavingPessoa(event: any) {
        // Grid Lazy: Salvar vai direto ao backend
        const row: any = event?.data || {};

        const selected = row._pessoaObj ?? row.pessoa;
        const pessoaId = typeof selected === 'object' ? selected?.id : selected;

        if (!pessoaId) {
            event.cancel = true;
            return;
        }

        let status = row.status;
        if (status && typeof status === 'object') {
            status = status.key ?? status.name;
        }

        const eventoId = this.vm.model.id!;

        this.eventoService.addOrUpdatePessoa(eventoId, pessoaId, status).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Salvo', detail: 'Registro atualizado.' });
                // Não precisa recarregar se for apenas update visual, mas para segurança:
                // this.buscarPessoasDoBackend();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar.' });
                event.cancel = true;
            }
        });
    }

    onDeletingPessoa(event: any) {
        const row: any = event?.data || {};
        const eventoId = this.vm.model?.id;
        if (!eventoId || !row.id) return;

        this.eventoService.removerPessoaVinculo(eventoId, row.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Removido', detail: 'Pessoa removida do evento.' });
                this.buscarPessoasDoBackend(); // Refresh essencial após delete em lazy grid
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover.' });
            }
        });
    }

    onEditingStartPessoa(event: any) {
        let data: any = event?.data || {};
        data._tab = 'geral';
        try {
            if (typeof data?.pessoa === 'object') {
                const id = data.pessoa?.id;
                const cached = this.pessoasSugestoes.find((p) => p.id === id);
                if (!cached) {
                    this.pessoaService.getById(id).subscribe({
                        next: (p) => {
                            this.pessoasSugestoes = [p, ...this.pessoasSugestoes];
                            data.pessoa = p;
                        },
                        error: () => {
                            this.pessoasSugestoes = [data.pessoa, ...this.pessoasSugestoes];
                        }
                    });
                }
            }
        } catch {}

        try {
            const eventoId = this.vm.model?.id;
            const pessoaId = typeof data?.pessoa === 'object' ? data.pessoa?.id : (data?.pessoaId ?? data?.pessoa);
            if (!eventoId || !pessoaId) return;
            this.pessoaEscolhaLoading = true;
            this.pessoaUltimaEscolha = null as any;
            this.pessoaHistorico = [] as any[];
            this.eventoService.getUltimaEscolha(eventoId as number, pessoaId as number).subscribe({
                next: (e) => {
                    this.pessoaUltimaEscolha = e;
                },
                error: () => (this.pessoaUltimaEscolha = null)
            });
            this.eventoService.getHistoricoEscolhas(eventoId as number, pessoaId as number).subscribe({
                next: (list) => {
                    this.pessoaHistorico = list || [];
                },
                error: () => (this.pessoaHistorico = [])
            });
        } finally {
            setTimeout(() => (this.pessoaEscolhaLoading = false), 300);
        }
    }

    onPessoaLimpar(row: any) {
        row.pessoa = null;
    }

    searchPessoas(event: any) {
        const query = (event?.filter || '').trim();
        let clienteId = this.abstractVM.getClienteId();
        if (!clienteId) return;
        this.pessoaService.findPessoaPorCliente(clienteId, query || undefined).subscribe({
            next: (list) => {
                this.pessoasSugestoes = list || [];
            },
            error: (_) => {
                this.pessoasSugestoes = [];
            }
        });
    }

    // =========================================================================
    //  OUTRAS ABAS (GERAL / PRODUTO) E AUXILIARES
    // =========================================================================

    onEventoLazyLoad(event: any) {
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;
        this.vm.filter.page = page;
        this.vm.filter.size = size;
        this.vm.filter.order = ['id,asc'];
        this.vm.doFilter().subscribe({
            error: (err) => this.handleListError(err)
        });
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
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

    onIniciarEvento() {
        const id = this.vm.model?.id;
        if (!id) {
            this.messageToastAddAndShow('Grave o evento antes de iniciar.');
            return;
        }
        const baseUrl = this.getPublicBaseUrl();
        this.eventoService.iniciarEvento(id as number, baseUrl).subscribe({
            next: (res) => {
                const n = res?.gerados ?? 0;
                this.abstractVM.preencherDetalhes(this.vm.model).subscribe({
                    next: (modelAtualizado) => {
                        this.vm.model = modelAtualizado;
                        this.vm.refreshModel.next();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Evento iniciado',
                            detail: `${n} link(s) gerados`
                        });
                    },
                    error: (err) => this.vm.messageToastShow(err)
                });
            },
            error: (err) => {
                const msg = err?.error?.message || 'Falha ao iniciar o evento.';
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
            }
        });
    }

    onPausarEvento() {
        const id = this.vm.model?.id;
        if (!id) return;
        this.eventoService.pausarEvento(id as number).subscribe({
            next: (res) => {
                const n = res?.pausados ?? 0;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Evento pausado',
                    detail: `${n} pessoa(s) pausadas`
                });
                this.vm.onIdParam(String(id));
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Falha ao pausar o evento.'
                })
        });
    }

    onPararEvento(): void {
        const id = this.vm.model?.id;
        if (!id) return;
        this.eventoService.pararEvento(id as number).subscribe({
            next: (eventoAtualizado) => {
                this.vm.model = { ...this.vm.model, ...eventoAtualizado };
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Evento parado com sucesso!' });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível parar o evento.' });
            }
        });
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
            this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Link copiado para a área de transferência' });
        } catch {
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
            } catch {}
            document.body.removeChild(ta);
            this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Link copiado para a área de transferência' });
        }
    }

    onSavingProduto(event: any) {
        const row: any = (event?.data || {}) as EventoProduto;
        if (!this.vm.model.eventoProdutos) this.vm.model.eventoProdutos = [];
        const produto = row.produto;
        const produtoId = typeof produto === 'object' ? produto?.id : produto;
        if (!produtoId) {
            this.messageToastAddAndShow('Selecione um Produto', 'Atenção', 'warn');
            event.cancel = true;
            return;
        }
        const duplicate = this.vm.model.eventoProdutos.some((pr: any) => {
            return pr?.produto?.id === produtoId && pr !== row;
        });
        if (duplicate) {
            this.messageToastAddAndShow('Esse produto já está na lista.', 'Atenção', 'warn');
            event.cancel = true;
            return;
        }
        row.produto = typeof produto === 'object' ? produto : this.produtosSugestoes.find((p) => p.id === produtoId);
        this.messageToastAddAndShow('Produto adicionado (pendente de Gravar).', 'Adicionado', 'success');
    }

    onEditingStartProduto(event: any) {
        this.filtroProduto.nome = '';
        this.filtroProduto.page = 0;
        const data: any = event?.data || {};
        const id = typeof data?.produto === 'object' ? data.produto?.id : data?.produto;
        if (!id) {
            data.produto = null;
            return;
        }
        const cached = this.produtosSugestoes.find((p) => p.id === id);
        if (cached) {
            data.produto = cached;
            return;
        }
        try {
            this.produtoService.getById(id).subscribe({
                next: (p) => {
                    data.produto = p;
                }
            });
        } catch {}
    }

    onDeletingProduto(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.eventoProdutos) return;
        const produtoId = typeof row.produto === 'object' ? row.produto?.id : row.produto;
        this.vm.model.eventoProdutos = this.vm.model.eventoProdutos.filter((pr: any) => (pr?.produto?.id || pr?.produto) !== produtoId);
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Produto removido.' });
    }

    private preencherCamposDeExibicao(): void {
        try {
            if (this.vm.model && this.vm.model.id) {
                this.vm.model.inicio = this.toDateOrNull(this.vm.model.inicio) as any;
                this.vm.model.fimPrevisto = this.toDateOrNull(this.vm.model.fimPrevisto) as any;
                this.vm.model.fim = this.toDateOrNull(this.vm.model.fim) as any;
            }
        } catch {}
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

    private carregarOpcoes(): void {
        const base: any = new EventoFilter();
        this.clienteService.getMe().subscribe({
            next: (clientes) => {
                this.clientesOptions = clientes || [];
                if (this.clientesOptions.length === 1) {
                    const unico = this.clientesOptions[0];
                    if (unico?.id) {
                        (this.vm.filter as any).clienteId = unico.id;
                        if (!(this.vm.model as any)?.cliente) {
                            (this.vm.model as any).cliente = unico;
                        }
                        try {
                            this.vm.doFilter().subscribe();
                        } catch {}
                    }
                }
                const idx = this.filterFields.findIndex((f) => f.key === 'clienteId');
                if (idx >= 0) {
                    this.filterFields[idx] = {
                        ...this.filterFields[idx],
                        options: this.clientesOptions.map((c) => {
                            return {
                                label: c?.nome ?? String(c?.id ?? ''),
                                value: c?.id
                            };
                        })
                    };
                }
                this.preencherCamposDeExibicao();
            },
            error: (_) => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar seus clientes (acesso negado).' });
            }
        });
    }

    private getPublicBaseUrl(): string {
        return window.location.origin;
    }

    private toDateOrNull(val: string | Date | null | undefined): Date | null {
        if (!val) return null;
        if (val instanceof Date) return val;
        const str = String(val);
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }

    protected onTabChangePrincipal(tabValue: any) {
        this.abaAtiva = tabValue;
        if (!this.abasVisitadas.has(tabValue)) {
            if (tabValue === 'produto') {
                this.searchProdutos();
            }
            this.abasVisitadas.add(tabValue);
        }
    }

    searchProdutos() {
        this.loading = true;
        this.produtoService.listar(this.filtroProduto).subscribe({
            next: (page) => {
                const produtosDtoSet = page?.content || [];
                this.produtosSugestoes = ProdutoMapper.fromDtoList(produtosDtoSet);
                this.filtroProduto.totalItens = page.totalElements || 0;
                this.loading = false;
            },
            error: (_) => {
                this.produtosSugestoes = [];
                this.loading = false;
            }
        });
    }

    protected onFilterProdutoSelect(event?: SelectFilterEvent) {
        this.filtroProduto.nome = event?.filter;
        this.filtroProduto.page = 0;
        this.searchProdutos();
    }

    onPageChangeProdutoPaginator(event: any) {
        if (event.originalEvent) event.originalEvent.stopPropagation();
        this.filtroProduto.page = event.page;
        this.filtroProduto.size = event.rows;
        this.searchProdutos();
    }

    onSearchInput(): void {
        this.filterSearchSubject.next();
    }

    // Boa prática: Limpar a inscrição quando sair da tela (opcional mas recomendado)
    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.filterSearchSubject.complete();
    }
}
