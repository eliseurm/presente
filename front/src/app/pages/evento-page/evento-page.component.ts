import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {Tabs, TabPanel, TabPanels, TabList, Tab} from 'primeng/tabs';
import {SelectModule} from 'primeng/select';
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
import {EventoPessoa} from '@/shared/model/evento-pessoa';
import {EventoProduto} from '@/shared/model/evento-produto';
import {PessoaService} from '@/services/pessoa.service';
import {ProdutoService} from '@/services/produto.service';
import {ClienteService} from '@/services/cliente.service';
import {Pessoa} from '@/shared/model/pessoa';
import {Produto} from '@/shared/model/produto';
import {Cliente} from '@/shared/model/cliente';
import {StatusEnum} from '@/shared/model/enum/status.enum';
import {EventoCrudVM} from './evento-crud.vm';
import {Router} from '@angular/router';
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
        ErmTemplateDirective
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
    pessoasOptions: Pessoa[] = [];
    produtosOptions: Produto[] = [];
    statusEnumType: any = StatusEnum;

    csvFile: File | null = null;

    // Diálogo de busca
    buscarDialog = false;
    filtroBuscaNome: string = '';
    loadingBusca = false;

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
        this.carregarOpcoes();
    }

    private carregarOpcoes(): void {
        const base: any = { page: 0, size: 9999, sort: 'id', direction: 'ASC' };
        this.clienteService.listar(base).subscribe({ next: page => {
            this.clientesOptions = page.content || [];
            // Atualiza opções do filtro Cliente
            const idx = this.filterFields.findIndex(f => f.key === 'clienteId');
            if (idx >= 0) {
                this.filterFields[idx] = {
                    ...this.filterFields[idx],
                    options: this.clientesOptions.map(c => ({ label: c?.nome ?? String(c?.id ?? ''), value: c?.id }))
                };
            }
        }});
        this.pessoaService.listar(base).subscribe({ next: page => this.pessoasOptions = page.content || [] });
        this.produtoService.listar(base).subscribe({ next: page => this.produtosOptions = page.content || [] });
    }

    onPage(event: any) {
        this.vm.filter.page = event.page;
        this.vm.filter.size = event.rows;
        this.vm.doFilter().subscribe();
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
        this.vm.doFilter().subscribe();
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

    addPessoa() {
        const pessoas = (this.vm.model.pessoas = this.vm.model.pessoas || []);
        pessoas.push({} as EventoPessoa);
    }
    removePessoa(index: number) {
        if (!this.vm.model.pessoas) return;
        this.vm.model.pessoas.splice(index, 1);
    }
    addProduto() {
        const produtos = (this.vm.model.produtos = this.vm.model.produtos || []);
        produtos.push({} as EventoProduto);
    }
    removeProduto(index: number) {
        if (!this.vm.model.produtos) return;
        this.vm.model.produtos.splice(index, 1);
    }

    // ======= Handlers para ERM Data Grid nas abas =======
    onInitNewPessoa(event: any) {
        event.data = event.data || {};
        event.data.pessoa = null;
        event.data.status = null;
    }

    onSavingPessoa(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.pessoas) this.vm.model.pessoas = [];
        // Normaliza pessoa (aceita objeto Pessoa inteiro ou apenas id)
        const pessoaId = typeof row.pessoa === 'object' ? row.pessoa?.id : row.pessoa;
        if (!pessoaId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione a Pessoa'});
            return;
        }
        const status = row.status || null;
        // Atualiza se já existir essa pessoa na lista; senão adiciona
        const idx = this.vm.model.pessoas.findIndex((p:any) => (p?.pessoa?.id || p?.pessoa) === pessoaId);
        const novo = { pessoa: this.pessoasOptions.find(p=>p.id===pessoaId) || {id: pessoaId} as any, status } as EventoPessoa;
        if (idx >= 0) this.vm.model.pessoas[idx] = novo; else this.vm.model.pessoas.push(novo);
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
        event.data.produto = null;
        event.data.status = null;
    }

    onSavingProduto(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.produtos) this.vm.model.produtos = [];
        const produtoId = typeof row.produto === 'object' ? row.produto?.id : row.produto;
        if (!produtoId) {
            this.messageService.add({severity:'warn', summary:'Atenção', detail:'Selecione o Produto'});
            return;
        }
        const status = row.status || null;
        const idx = this.vm.model.produtos.findIndex((pr:any) => (pr?.produto?.id || pr?.produto) === produtoId);
        const novo = { produto: this.produtosOptions.find(p=>p.id===produtoId) || {id: produtoId} as any, status } as EventoProduto;
        if (idx >= 0) this.vm.model.produtos[idx] = novo; else this.vm.model.produtos.push(novo);
        this.messageService.add({severity:'success', summary:'OK', detail:'Produto registrado na lista do evento (pendente de Gravar).'});
    }

    onDeletingProduto(event: any) {
        const row: any = event?.data || {};
        if (!this.vm.model.produtos) return;
        const produtoId = typeof row.produto === 'object' ? row.produto?.id : row.produto;
        this.vm.model.produtos = this.vm.model.produtos.filter((pr:any) => (pr?.produto?.id || pr?.produto) !== produtoId);
        this.messageService.add({severity:'success', summary:'OK', detail:'Produto removido da lista (pendente de Gravar).'});
    }


}
