import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ToastModule} from 'primeng/toast';
import {MultiSelectModule} from 'primeng/multiselect';
import {TableModule} from 'primeng/table';
import {EDataGridComponent, EiColumnComponent, ETemplateDirective} from '@/shared/components/e-data-grid';

import {CrudComponent} from '@/shared/crud/crud.component';
import {ProdutoService} from '@/services/produto.service';
import {ProdutoFilter} from '@/shared/model/filter/produto-filter';
import {Produto} from '@/shared/model/produto';
import {CrudFilterComponent} from '@/shared/components/crud-filter/crud-filter.component';
import {FilterField} from '@/shared/components/crud-filter/filter-field';
import {CorService} from '@/services/cor.service';
import {TamanhoService} from '@/services/tamanho.service';
import {ImagemService} from '@/services/imagem.service';
import {Cor} from '@/shared/model/cor';
import {Tamanho} from '@/shared/model/tamanho';
import {Imagem} from '@/shared/model/imagem';
import {CorFilter} from '@/shared/model/filter/cor-filter';
import {TamanhoFilter} from '@/shared/model/filter/tamanho-filter';
import {ImagemFilter} from '@/shared/model/filter/imagem-filter';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {ProdutoCrudVM} from './produto-crud.vm';

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
        TableModule,
        EDataGridComponent,
        EiColumnComponent,
        ETemplateDirective,
        CrudComponent,
        CrudFilterComponent,
    ],
    templateUrl: './produto-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss'
    ],
    providers: [MessageService, ProdutoCrudVM]
})
@CrudMetadata("ProdutoPageComponent", [Produto, ProdutoFilter])
export class ProdutoPageComponent {
    @ViewChild('crudRef') crudRef?: CrudComponent<Produto, ProdutoFilter>;
    // Opções
    coresOptions: Cor[] = [];
    tamanhosOptions: Tamanho[] = [];
    imagensOptions: Imagem[] = [];

    readonly filterFields: FilterField[] = [
        {key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome'}
    ];

    constructor(
        public vm: ProdutoCrudVM,
        private produtoService: ProdutoService,
        private corService: CorService,
        private tamanhoService: TamanhoService,
        private imagemService: ImagemService,
        private messageService: MessageService,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        this.vm.init();
        this.loadOptions();
    }

    loadOptions(): void {
        // Carrega primeiras páginas de opções (poderia ser paginado/filtrado no futuro)
        const filter = new ProdutoFilter();
        this.corService.listar(new CorFilter(filter)).subscribe({
            next: (page) => this.coresOptions = page.content || [],
            error: () => {
            }
        });
        this.tamanhoService.listar(new TamanhoFilter(filter)).subscribe({
            next: (page) => this.tamanhosOptions = page.content || [],
            error: () => {
            }
        });
        this.imagemService.listar(new ImagemFilter(filter)).subscribe({
            next: (page) => this.imagensOptions = page.content || [],
            error: () => {
            }
        });
    }

    isFormularioValido(): boolean {
        return !!(this.vm?.model?.nome?.trim());
    }

    // Integração com o contêiner <crud>
    onLazyLoad(event: any) {
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;
        this.vm.filter.page = page;
        this.vm.filter.size = size;
        this.vm.filter.order = ['nome,asc'];
        this.vm.doFilter().subscribe();
    }

    onClearFilters() {
        this.vm.filter = new ProdutoFilter();
        this.vm.doFilter().subscribe();
    }

    onCloseCrud() {
        this.router.navigate(['/']);
    }

    onInitNewRow(event: any) {
        event.data.status = true;
        event.data.cores = [];
        event.data.tamanhos = [];
        event.data.imagens = [];
    }

    onSavingItem(event: any) {
        const data = event.data as Produto;
        if (!data?.nome?.trim()) {
            this.messageService.add({severity: 'warn', summary: 'Atenção', detail: 'Informe o nome do produto'});
            return;
        }

        // O CrudComponent chamará vm.doSave(); aqui apenas garantimos que o evento não quebre o fluxo
    }

    onDeletingItem(event: any) {
        const id = (event?.data as any)?.id;
        if (!id) return;
        this.produtoService.deletar(id).subscribe({
            next: () => {
                this.messageService.add({severity: 'success', summary: 'Sucesso', detail: `Dado excluído com sucesso`});
                // Após excluir, recarrega a lista usando a ViewModel do CRUD
                this.vm.doFilter().subscribe();
            },
            error: () => this.messageService.add({severity: 'error', summary: 'Erro', detail: `Erro ao excluir informações`})
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
