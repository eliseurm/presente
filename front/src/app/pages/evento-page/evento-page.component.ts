import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Tabs, TabPanel, TabPanels, TabList, Tab } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
import {
  ErmColumnComponent,
  ErmDataGridComponent,
  ErmEditingComponent,
  ErmFormComponent,
  ErmItemComponent,
  ErmPopupComponent,
  ErmTemplateDirective
} from '@/shared/components/erm-data-grid';

import { EventoService } from '@/services/evento.service';
import { Evento } from '@/shared/model/evento';
import { EventoFilter } from '@/shared/model/filter/evento-filter';
import { EventoPessoa } from '@/shared/model/evento-pessoa';
import { EventoProduto } from '@/shared/model/evento-produto';
import { PessoaService } from '@/services/pessoa.service';
import { ProdutoService } from '@/services/produto.service';
import { ClienteService } from '@/services/cliente.service';
import { Pessoa } from '@/shared/model/pessoa';
import { Produto } from '@/shared/model/produto';
import { Cliente } from '@/shared/model/cliente';
import { StatusEnum } from '@/shared/model/enum/status.enum';

@Component({
  selector: 'evento-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    DialogModule,
    Tabs,
    TabPanel,
    TabPanels,
    TabList,
    Tab,
    SelectModule,
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmPopupComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmColumnComponent,
    ErmTemplateDirective
  ],
  templateUrl: './evento-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService]
})
export class EventoPageComponent extends CrudBaseComponent<Evento, EventoFilter> {

  // Opções
  clientesOptions: Cliente[] = [];
  pessoasOptions: Pessoa[] = [];
  produtosOptions: Produto[] = [];
  statusEnumType: any = StatusEnum;

  csvFile: File | null = null;

  // Diálogo de busca
  buscarDialog = false;
  filtroBuscaNome: string = '';
  loadingBusca = false;

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
  ];

  constructor(
    private eventoService: EventoService,
    private pessoaService: PessoaService,
    private produtoService: ProdutoService,
    private clienteService: ClienteService,
    messageService: MessageService
  ) {
    super(eventoService, messageService, null as any);
  }

  // Helpers para adicionar itens nas listas evitando erros de tipagem no template
  addPessoa() {
    const pessoas = (this.model.pessoas = this.model.pessoas || []);
    pessoas.push({} as EventoPessoa);
  }

  addProduto() {
    const produtos = (this.model.produtos = this.model.produtos || []);
    produtos.push({} as EventoProduto);
  }

  // override ngOnInit(): void {
  //   super.ngOnInit();
  //   this.loadOptions();
  // }

/*
  loadOptions(): void {
    const base: any = { page: 0, size: 9999, sort: 'id', direction: 'ASC' };
    // Clientes
    this.clienteService.listar(base).subscribe({ next: page => this.clientesOptions = page.content || [] });
    // Pessoas
    this.pessoaService.listar(base).subscribe({ next: page => this.pessoasOptions = page.content || [] });
    // Produtos
    this.produtoService.listar(base).subscribe({ next: page => this.produtosOptions = page.content || [] });
  }
*/

  override criarInstancia(): Evento {
    return { nome: '', status: this.statusEnumType.ATIVO, pessoas: [], produtos: [] } as unknown as Evento;
  }

  override isFormularioValido(): boolean {
    return !!(this.model?.nome?.trim());
  }

  override getEntityLabelSingular(): string { return 'Evento'; }
  override getEntityLabelPlural(): string { return 'Eventos'; }

  override buildDefaultFilter(): EventoFilter {
    return new EventoFilter({ page: 0, size: 10, sort: 'id', direction: 'ASC' });
  }

  override getDeleteConfirmMessage(item: Evento): string {
    return `Deseja realmente excluir o evento "${item.nome}"?`;
  }
  override getBatchDeleteConfirmMessage(count: number): string {
    return `Deseja realmente excluir ${count} evento(s) selecionado(s)?`;
  }
  override getTableColumnCount(): number { return 4; }

  // Métodos específicos
  currentEditingRow: any = null;

  // Novo fluxo: Toolbar e Busca
  abrirBusca() {
    this.buscarDialog = true;
    this.carregarBusca();
  }

  carregarBusca() {
    this.loadingBusca = true;
    const filtro = new EventoFilter();
    if (this.filtroBuscaNome && this.filtroBuscaNome.trim()) {
      filtro.nome = this.filtroBuscaNome.trim();
      filtro.direction = 'DESC'
    }
    this.eventoService.listar(filtro).subscribe({
      next: (resp: any) => {
        this.dataSource = resp?.content || [];
        this.loadingBusca = false;
      },
      error: () => {
        this.loadingBusca = false;
      }
    });
  }

  selecionarEvento(e: Evento) {
    // Clona para evitar binding direto da lista
    const clone: any = JSON.parse(JSON.stringify(e || {}));
    // Ajusta status para objeto enum quando vier string
    if (clone?.status && typeof clone.status === 'string' && this.statusEnumType[clone.status]) {
      clone.status = this.statusEnumType[clone.status];
    }
    // Garante arrays
    clone.pessoas = clone.pessoas || [];
    clone.produtos = clone.produtos || [];
    this.model = clone;
    this.buscarDialog = false;
  }

  private toLocalDateTimeString(value: any): string | null {
    if (!value) return null;
    // Se já é string no formato correto com segundos, retorna
    if (typeof value === 'string') {
      // Normaliza: se vier sem segundos (yyyy-MM-ddTHH:mm), adiciona ":00"
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
        return value + ':00';
      }
      // Se vier com segundos, mantém
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
        return value;
      }
      // Tenta parsear outras variantes
      const d = new Date(value);
      if (!isNaN(d.getTime())) return this.toLocalDateTimeString(d);
      return value;
    }
    // Se for Date, monta string local sem fuso (LocalDateTime)
    if (value instanceof Date) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = value.getFullYear();
      const MM = pad(value.getMonth() + 1);
      const dd = pad(value.getDate());
      const HH = pad(value.getHours());
      const mm = pad(value.getMinutes());
      const ss = pad(value.getSeconds());
      return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
    }
    return null;
  }

  gravar() {
    const data = this.model as Evento;
    // Validações obrigatórias
    const hasNome = !!data?.nome?.trim();
    const hasCliente = !!((data as any)?.cliente?.id ?? (data as any)?.cliente);
    const hasStatus = !!data?.status;
    const hasInicio = !!data?.inicio;
    const hasPrevisto = !!data?.fimPrevisto;
    if (!(hasNome && hasCliente && hasStatus && hasInicio && hasPrevisto)) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios: Nome, Cliente, Status, Início e Previsto.' });
      return;
    }

    const normalizeStatus = (val: any) => (val && typeof val === 'object' && 'key' in val) ? val.key : val;
    const mapPessoa = (arr?: any[]) => (arr || [])
      .filter((x: any) => x && (x.pessoa?.id || typeof x.pessoa === 'number'))
      .map((x: any) => ({ id: x.id, pessoa: { id: x.pessoa?.id ?? x.pessoa }, status: normalizeStatus(x.status) }));
    const mapProduto = (arr?: any[]) => (arr || [])
      .filter((x: any) => x && (x.produto?.id || typeof x.produto === 'number'))
      .map((x: any) => ({ id: x.id, produto: { id: x.produto?.id ?? x.produto }, status: normalizeStatus(x.status) }));

    const payload: any = {
      id: (data as any).id,
      nome: data.nome,
      descricao: data.descricao,
      cliente: (data as any)?.cliente?.id ? { id: (data as any).cliente.id } : (data?.cliente ? { id: (data as any).cliente } : null),
      status: normalizeStatus(data.status),
      anotacoes: data.anotacoes,
      inicio: this.toLocalDateTimeString(data.inicio),
      fimPrevisto: this.toLocalDateTimeString(data.fimPrevisto),
      fim: this.toLocalDateTimeString(data.fim),
      pessoas: mapPessoa(data.pessoas),
      produtos: mapProduto(data.produtos)
    };

    const id = payload.id;
    const op$ = id ? this.eventoService.atualizar(id, payload) : this.eventoService.criar(payload);
    op$.subscribe({
      next: (resp: any) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso` });
        // Atualiza o model com retorno (garante id)
        this.selecionarEvento(resp);
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar evento';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  novoRegistro() {
    this.model = this.criarInstancia();
  }

  excluir() {
    const id = (this.model as any)?.id;
    if (!id) return;
    this.eventoService.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} excluído com sucesso` });
        this.novoRegistro();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}` })
    });
  }

  onCsvSelected(event: any) {
    const file = event?.target?.files?.[0] as File | undefined;
    this.csvFile = file || null;
  }

  importarCsvPessoas(rowData: any) {
    const eventoId = rowData?.id;
    if (!eventoId) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Salve o evento antes de importar pessoas.' });
      return;
    }
    if (!this.csvFile) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione um arquivo CSV.' });
      return;
    }
    this.eventoService.importPessoasCsv(eventoId, this.csvFile!).subscribe({
      next: (resp) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${resp?.adicionados ?? 0} pessoa(s) importada(s)` });
        this.csvFile = null;
        // Recarrega o evento da API para refletir alterações
        this.eventoService.buscarPorId(eventoId).subscribe({
          next: (ev) => this.selecionarEvento(ev as any)
        });
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao importar CSV';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

}
