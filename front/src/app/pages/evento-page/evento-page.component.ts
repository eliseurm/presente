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

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
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
    Tabs,
    TabPanel,
    TabPanels,
    TabList,
    Tab,
    SelectModule,
    CrudFilterComponent,
    ErmDataGridComponent,
    ErmEditingComponent,
    ErmPopupComponent,
    ErmFormComponent,
    ErmItemComponent,
    ErmColumnComponent,
    ErmValidationRuleComponent,
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

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  loadOptions(): void {
    const base: any = { page: 0, size: 9999, sort: 'id', direction: 'ASC' };
    // Clientes
    this.clienteService.listar(base).subscribe({ next: page => this.clientesOptions = page.content || [] });
    // Pessoas
    this.pessoaService.listar(base).subscribe({ next: page => this.pessoasOptions = page.content || [] });
    // Produtos
    this.produtoService.listar(base).subscribe({ next: page => this.produtosOptions = page.content || [] });
  }

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

  onInitNewRow(event: any) {
    this.currentEditingRow = event.data;
    this.model = event.data;
    event.data.status = this.statusEnumType.ATIVO;
    event.data.pessoas = [];
    event.data.produtos = [];
  }

  onSavingItem(event: any) {
    const data = event.data as Evento;
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

    // Normaliza associações para enviar somente IDs nas referências internas
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
      inicio: data.inicio,
      fimPrevisto: data.fimPrevisto,
      fim: data.fim,
      pessoas: mapPessoa(data.pessoas),
      produtos: mapProduto(data.produtos)
    };

    const id = payload.id;
    const op$ = id ? this.eventoService.atualizar(id, payload) : this.eventoService.criar(payload);
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso` });
        this.carregar();
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar evento';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  onDeletingItem(event: any) {
    const id = (event?.data as any)?.id;
    if (!id) return;
    this.eventoService.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} excluído com sucesso` });
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}` })
    });
  }

  onEditDialogOpen(event: any) {
    this.currentEditingRow = event?.data || null;
    if (event?.data) {
      this.model = event.data;
    }
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
        this.carregar();
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao importar CSV';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  // Helpers de exibição
  getPessoaNome(ep: EventoPessoa): string {
    const p: any = ep?.pessoa;
    return p?.nome || '';
  }

  getProdutoNome(epr: EventoProduto): string {
    const p: any = epr?.produto;
    return p?.nome || '';
  }
}
