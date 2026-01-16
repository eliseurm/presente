import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
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
    EiColumnComponent,
    EiItemComponent,
    EiValidationRuleComponent,
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
import {debounceTime, forkJoin, map, of, Subject} from 'rxjs';
import {ProdutoFilter} from '@/shared/model/filter/produto-filter';
import {ProdutoMapper} from '@/shared/model/mapper/produto-mapper';
import {EventoProduto} from '@/shared/model/evento-produto';
import {Paginator} from "primeng/paginator";
import {EventoPessoaFilter} from "@/shared/model/filter/evento-pessoa-filter";
import {EventoPessoa} from "@/shared/model/evento-pessoa";
import {Mode} from "@/shared/crud/crud.mode";
import {ConfirmDialog} from "primeng/confirmdialog";
import {ProgressBar} from "primeng/progressbar";
import {ProgressoTarefaDto} from "@/shared/model/dto/processo-tarefe-dto";
import {EventoPessoaDto} from "@/shared/model/dto/evento-pessoa-dto";
import {EventoPessoaMapper} from "@/shared/model/mapper/evento-pessoa-mapper";
import {catchError} from "rxjs/operators"; // Certifique-se que este arquivo existe

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
        Paginator,
        ConfirmDialog,
        ProgressBar
    ],
    templateUrl: './evento-page.component.html',
    styleUrls: ['./evento-page.component.scss', '../../shared/components/crud-base/crud-base.component.scss'],
    providers: [MessageService, EventoCrudVM, ConfirmationService]
})
@CrudMetadata('EventoPageComponent', [Evento, EventoFilter])
export class EventoPageComponent extends CrudBaseComponent<Evento, EventoFilter> {

    // Opções Gerais
    clientesOptions: Cliente[] = [];
    statusEnumType: any = StatusEnum;
    modeType = Mode;

    abasVisitadas = new Set<string>();
    abaAtiva: string = 'geral';

    // ======= Grid Paginada (Lazy Load) =======
    // listaPessoasPaginada: any[] = [];
    // totalPessoas: number = 0;
    loadingPessoas: boolean = false;

    pessoasGridDisplay: any[] = [];
    selectedPessoas: any[] = [];
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
    pessoasSelecionadasPopup: Pessoa[] = [];
    statusSelecionadoPopup: any = null;

    // ======= Controles de Importação e Logs =======
    inputArquivoSelecionado: any;
    importacaoLogs: string[] = [];
    progressoTarefaDto: ProgressoTarefaDto = new ProgressoTarefaDto();
    timerStatus: any;

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
        private router: Router,
        private confirmationService: ConfirmationService
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

        // Busca do filtro de pessoas (aba pessoas)
        this.filterSearchSubject.pipe(debounceTime(2000)).subscribe(() => {
            this.filtrarPessoasLocalmente(); // Chama sua função de filtro
        });

        this.vm.refreshModel.subscribe(() => {
            this.preencherCamposDeExibicao();
            // Carrega a primeira página da grid ao abrir o evento
            this.buscarPessoasDoBackend();
            this.verificaProgresso();

        });


        this.carregarOpcoes();
    }



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


    onPopupPessoaAbre() {
        this.pessoasSelecionadasPopup = [];
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

    onPopupPessoaCancela() {
        this.addPessoasDialogVisible = false;
        this.pessoasSelecionadasPopup = [];
    }

    onPopupPessoaSalva() {
        const selecionados = this.pessoasSelecionadasPopup || [];
        if (!selecionados.length) return;

        let status = this.statusSelecionadoPopup;
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
                this.eventoService.addOrUpdateEventoPessoa(eventoId, p.id, status);
            }
        });

        forkJoin(observables).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Adicionado', detail: `${selecionados.length} pessoas adicionadas.` });
                this.addPessoasDialogVisible = false;
                this.pessoasSelecionadasPopup = [];
                this.buscarPessoasDoBackend(); // Recarrega grid do servidor
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar algumas pessoas.' });
            }
        });
    }

    onEditaEventoPessoa(event: any) {
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


    onSalvaEventoPessoa(event: any) {
        const row: any = event?.data || {};
        const eventoId = this.vm.model.id!;

        event.asyncResult = this.eventoService.addOrUpdateEventoPessoa(eventoId, row).pipe(
            map(res => {
                // Se chegou aqui, a API salvou com sucesso.
                // O Grid vai fechar o popup e atualizar a lista.
                return true;
            }),
            catchError(err => {
                const errorBody = err.error;
                let msg = errorBody?.message;
                if (errorBody?.errors?.length > 0) {
                    errorBody?.errors.forEach((e:any) => {
                        msg += (', '+e.error);
                    });
                }

                // Injeta a mensagem no evento para o e-data-grid exibir no popup
                event.validationMessage = msg || "Erro ao salvar registro.";

                return of(false); // Impede o fechamento do popup
            })
        );
    }

    onDeletaEventoPessoa(event: any) {
        const row: any = event?.data || {};
        const eventoId = this.vm.model?.id;
        if (!eventoId || !row.id) return;

        this.eventoService.eventoPessoaDeleteLote(eventoId, [row.id]).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Removido', detail: 'Pessoa removida do evento.' });
                this.buscarPessoasDoBackend(); // Refresh essencial após delete em lazy grid
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover.' });
            }
        });
    }

    onDeletaEventoPessoaBloco() {
        this.confirmationService.confirm({
            message: `Deseja excluir as ${this.selectedPessoas.length} pessoas selecionadas?`,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                const eventoId = this.vm.model?.id;
                const ids = this.selectedPessoas.map(p => p.id);

                // Chama o serviço para excluir no back-end
                this.eventoService.eventoPessoaDeleteLote(eventoId, ids).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Salvo',
                            detail: 'Pessoas removidas com sucesso'
                        });

                        // Remove localmente da grid para não precisar recarregar tudo
                        this.pessoasGridDisplay = this.pessoasGridDisplay.filter((p: any) => !ids.includes(p.id));
                        this.selectedPessoas = []; // Limpa a seleção
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Não foi possível excluir as pessoas.'
                        });
                    }
                });
            }
        });
    }


    onEventoLazyLoad(event: any) {
        this.loading = true;
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;
        this.vm.filter.page = page;
        this.vm.filter.size = size;
        this.vm.filter.order = ['id,asc'];
        this.vm.doFilter().subscribe({
            next: (list) => {
                this.loading = false;
            },
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

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.filterSearchSubject.complete();
    }



    onImportaArquivoCsv(event: any) {
        const file = event.target.files[0];
        if (file) {
            // this.inputArquivoSelecionado = event.target as HTMLInputElement;
            // if (this.inputArquivoSelecionado.files && this.inputArquivoSelecionado.files.length > 0) {
            //     const file = this.inputArquivoSelecionado.files[0];
            const eventoId = this.vm.model?.id;

            if (!eventoId) {
                this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Salve o evento antes de importar.' });
                return;
            }

            this.progressoTarefaDto.progresso = true;
            this.importacaoLogs = [];

            this.eventoService.iniciaImportacaoArquivoCsv(eventoId, file).subscribe({
                next: (res: any) => {
                    this.verificaProgresso();

                },
                error: (err) => {
                    this.progressoTarefaDto.progresso = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro Fatal',
                        detail: err?.error?.message || 'Falha ao enviar arquivo.'
                    });
                    this.inputArquivoSelecionado.value = '';
                }
            });

            event.target.value = '';
        }
    }

    onEnviarEmails() {
        this.confirmationService.confirm({
            message: 'Deseja enviar o e-mail de convite para todas as pessoas ativas deste evento? Antes de enviar, salve todas as alterações',
            header: 'Confirmar Envio',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {

                this.progressoTarefaDto.progresso = true;

                this.eventoService.iniciaEnvioEmails(this.vm.model.id).subscribe({
                    next: () => {
                        this.verificaProgresso();
                        // this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'O processo de envio foi iniciado.' });
                        // this.enviandoEmails = false;
                    },
                    error: (err) => {
                        this.progressoTarefaDto.progresso = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro Fatal',
                            detail: err?.error?.message || 'Falha ao enviar arquivo.'
                        });
                    }
                });
            }
        });
    }

    private verificaProgresso() {
        // Vejo se tem algum processo rodando
        this.eventoService.getStatusProgresso(this.vm.model.id).subscribe({
            next: res => {
                Object.assign(this.progressoTarefaDto, res);

                if (res.status === 'PROCESSANDO') {
                    this.progressoTarefaDto.progresso = true;
                    // Se não houver um timer rodando, cria um para perguntar de novo em 3 segundos
                    if (!this.timerStatus) {
                        this.timerStatus = setInterval(() => this.verificaProgresso(), 1000);
                    }
                }
                else {
                    this.progressoTarefaDto.progresso = false;
                    if (this.timerStatus) {
                        clearInterval(this.timerStatus);
                        this.timerStatus = null;
                    }

                    if (res.progressoId === 'progressArquivo') {
                        this.finalizaImportacaoCsv(res);
                    }

                    if (res.progressoId === 'progressEmail') {
                        this.finalizaEnvioEmails(res);
                    }

                }
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    private finalizaImportacaoCsv(res: ProgressoTarefaDto) {
        this.progressoTarefaDto.progresso = false;
        const adicionados = res?.total ?? 0;
        const logs = res?.logErros ?? [];

        if (adicionados > 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: `${adicionados} pessoas importadas.`
            });
            this.onRefreshGridPessoas(); // Recarrega do backend
        } else if (logs.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'Nenhuma pessoa nova foi adicionada.'
            });
        }

        if (logs.length > 0) {
            this.importacaoLogs = logs;
            this.abaAtiva = 'log'; // Troca aba para mostrar erro
            this.messageService.add({
                severity: 'error',
                summary: 'Erros na Importação',
                detail: 'Verifique a aba de Log.'
            });
        }

        this.inputArquivoSelecionado = '';
        this.buscarPessoasDoBackend();
    }

    private finalizaEnvioEmails(res: ProgressoTarefaDto) {
        this.progressoTarefaDto.progresso = false;
        const adicionados = res?.total ?? 0;
        const logs = res?.logErros ?? [];

        if (adicionados > 0) {
            this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: `${adicionados} e-Mails enviados com sucesso.`
            });
        }
        else if (logs.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'Nem um e-Mail foi enviado.'
            });
        }

        if (logs.length > 0) {
            this.importacaoLogs = logs;
            this.abaAtiva = 'log'; // Troca aba para mostrar erro
            this.messageService.add({
                severity: 'error',
                summary: 'Erros no envio de e-Mail',
                detail: 'Verifique a aba de Log.'
            });
        }

    }

    protected limparLogs() {
        this.importacaoLogs = [];
        this.abaAtiva = 'pessoa';
    }

    protected pararProcesso() {
        this.eventoService.pararProgresso(this.vm.model.id).subscribe({
            next: res => {
                Object.assign(this.progressoTarefaDto, res);

                this.progressoTarefaDto.progresso = false;
                if (res.progressoId === 'progressArquivo') {
                    this.finalizaImportacaoCsv(res);
                }

                if (this.timerStatus) {
                    clearInterval(this.timerStatus);
                    this.timerStatus = null;
                }
            },
            error: (err) => {
                console.error(err);
            }
        });

    }

}
