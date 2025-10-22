import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';

import { CrudBaseComponent } from '@/shared/components/crud-base/crud-base.component';
import { ProdutoService } from '@/services/produto.service';
import { ProdutoFilter } from '@/shared/model/filter/produto-filter';
import { Produto } from '@/shared/model/produto';
import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import { FilterField } from '@/shared/components/crud-filter/filter-field';
import { CorService } from '@/services/cor.service';
import { TamanhoService } from '@/services/tamanho.service';
import { ImagemService } from '@/services/imagem.service';
import { Cor } from '@/shared/model/cor';
import { Tamanho } from '@/shared/model/tamanho';
import { Imagem } from '@/shared/model/imagem';
import { CorFilter } from '@/shared/model/filter/cor-filter';
import { TamanhoFilter } from '@/shared/model/filter/tamanho-filter';
import { ImagemFilter } from '@/shared/model/filter/imagem-filter';
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
  selector: 'produto-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    MultiSelectModule,
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
  templateUrl: './produto-page.component.html',
  styleUrls: [
    '../../shared/components/crud-base/crud-base.component.scss'
  ],
  providers: [MessageService]
})
export class ProdutoPageComponent extends CrudBaseComponent<Produto, ProdutoFilter> {
  // Opções
  coresOptions: Cor[] = [];
  tamanhosOptions: Tamanho[] = [];
  imagensOptions: Imagem[] = [];

  readonly filterFields: FilterField[] = [
    { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' }
  ];

  constructor(
    private produtoService: ProdutoService,
    private corService: CorService,
    private tamanhoService: TamanhoService,
    private imagemService: ImagemService,
    messageService: MessageService
  ) {
    super(produtoService, messageService, null as any);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadOptions();
  }

  loadOptions(): void {
    // Carrega primeiras páginas de opções (poderia ser paginado/filtrado no futuro)
    const base = { page: 0, size: 9999, sort: 'id', direction: 'ASC' } as any;
    this.corService.listar(new CorFilter(base)).subscribe({
      next: (page) => this.coresOptions = page.content || [],
      error: () => {}
    });
    this.tamanhoService.listar(new TamanhoFilter(base)).subscribe({
      next: (page) => this.tamanhosOptions = page.content || [],
      error: () => {}
    });
    this.imagemService.listar(new ImagemFilter(base)).subscribe({
      next: (page) => this.imagensOptions = page.content || [],
      error: () => {}
    });
  }

  override criarInstancia(): Produto {
    return { nome: '', status: true, preco: 0, descricao: '', cores: [], tamanhos: [], imagens: [] } as Produto;
  }

  override isFormularioValido(): boolean {
    return !!(this.model?.nome?.trim());
  }

  override getEntityLabelSingular(): string { return 'Produto'; }
  override getEntityLabelPlural(): string { return 'Produtos'; }

  override buildDefaultFilter(): ProdutoFilter {
    return new ProdutoFilter({ page: 0, size: 10, sort: 'id', direction: 'ASC' });
  }

  override getDeleteConfirmMessage(item: Produto): string {
    return `Deseja realmente excluir o produto "${item.nome}"?`;
  }
  override getBatchDeleteConfirmMessage(count: number): string {
    return `Deseja realmente excluir ${count} produto(s) selecionado(s)?`;
  }
  override getTableColumnCount(): number { return 5; }

  onInitNewRow(event: any) {
    event.data.status = true;
    event.data.cores = [];
    event.data.tamanhos = [];
    event.data.imagens = [];
  }

  onSavingItem(event: any) {
    const data = event.data as Produto;
    if (!data?.nome?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o nome do produto' });
      return;
    }

    // Normaliza associações para enviar somente IDs
    const mapToIds = (arr?: any[]) => (arr || []).filter(x => !!x).map((x: any) => ({ id: x.id }));
    const payload: any = {
      id: (data as any).id,
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      status: data.status,
      cores: mapToIds(data.cores),
      tamanhos: mapToIds(data.tamanhos),
      imagens: mapToIds(data.imagens)
    };

    const id = payload.id;
    const op$ = id ? this.produtoService.atualizar(id, payload) : this.produtoService.criar(payload);
    op$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} ${id ? 'atualizado' : 'criado'} com sucesso` });
        this.carregar();
      },
      error: (error) => {
        const detail = error?.error?.message || 'Erro ao salvar produto';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail });
      }
    });
  }

  onDeletingItem(event: any) {
    const id = (event?.data as any)?.id;
    if (!id) return;
    this.produtoService.deletar(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `${this.getEntityLabelSingular()} excluído com sucesso` });
        this.carregar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Erro ao excluir ${this.getEntityLabelSingular().toLowerCase()}` })
    });
  }

  getImagemUrl(img: Imagem): string | null {
    return this.imagemService.getArquivoUrl(img?.id);
  }

  getCoresTexto(p: any): string {
    const arr = (p?.cores || []) as any[];
    return arr.map(c => c?.nome).filter(Boolean).join(', ');
  }
  getTamanhosTexto(p: any): string {
    const arr = (p?.tamanhos || []) as any[];
    return arr.map(t => t?.tamanho).filter(Boolean).join(', ');
  }
}
