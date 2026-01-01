import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
// Modules do PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
// ALTERAÇÃO AQUI: De DropdownModule para SelectModule
import { SelectModule } from 'primeng/select';

import { EDataGridComponent, EiColumnComponent, ETemplateDirective } from '@/shared/components/e-data-grid';
import { CrudComponent } from '@/shared/crud/crud.component';
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
import { CrudMetadata } from '@/shared/core/crud.metadata.decorator';
import { ProdutoCrudVM } from './produto-crud.vm';
import { StatusEnum } from '@/shared/model/enum/status.enum';
import { EnumSelectComponent } from '@/shared/components/enum-select/enum-select.component';
import { ProdutoEstoque } from '@/shared/model/produto-estoque';
import { TabsModule } from 'primeng/tabs';

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
        TableModule,
        TooltipModule,
        TabsModule,
        SelectModule,
        EDataGridComponent,
        EiColumnComponent,
        ETemplateDirective,
        CrudComponent,
        CrudFilterComponent,
        EnumSelectComponent
    ],
    templateUrl: './produto-page.component.html',
    styleUrls: ['../../shared/components/crud-base/crud-base.component.scss'],
    providers: [MessageService, ProdutoCrudVM]
})
@CrudMetadata('ProdutoPageComponent', [Produto, ProdutoFilter])
export class ProdutoPageComponent {
    // ... O restante do código da classe permanece igual ...
    @ViewChild('crudRef') crudRef?: CrudComponent<Produto, ProdutoFilter>;

    statusEnumType: any = StatusEnum;
    coresOptions: Cor[] = [];
    tamanhosOptions: Tamanho[] = [];
    imagensDisponiveis: Imagem[] = [];
    estoqueTemp: Partial<ProdutoEstoque> = {};
    readonly filterFields: FilterField[] = [{ key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' }];

    constructor(
        public vm: ProdutoCrudVM,
        private produtoService: ProdutoService,
        private corService: CorService,
        private tamanhoService: TamanhoService,
        private imagemService: ImagemService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.vm.init();
        this.loadOptions();
        this.resetEstoqueTemp();
    }
    // ... demais métodos ...

    // Certifique-se de manter os métodos loadOptions, adicionarEstoque, etc.
    // ...
    loadOptions(): void {
        this.corService.listar(new CorFilter()).subscribe({
            next: (page) => (this.coresOptions = page.content || []),
            error: () => {}
        });

        this.tamanhoService.listar(new TamanhoFilter()).subscribe({
            next: (page) => (this.tamanhosOptions = page.content || []),
            error: () => {}
        });

        this.imagemService.listar(new ImagemFilter()).subscribe({
            next: (page) => {
                this.imagensDisponiveis = page.content || [];
            },
            error: () => {}
        });
    }

    getImagemUrl(img: Imagem | number): string | null {
        const id = typeof img === 'number' ? img : img?.id;
        return this.imagemService.getArquivoUrl(id);
    }

    isImagemSelecionada(img: Imagem): boolean {
        return (this.vm.model.imagens || []).some((sel) => sel.id === img.id);
    }

    toggleImagem(img: Imagem): void {
        if (!this.vm.model.imagens) {
            this.vm.model.imagens = [];
        }

        const index = this.vm.model.imagens.findIndex((sel) => sel.id === img.id);
        if (index > -1) {
            this.vm.model.imagens.splice(index, 1);
        } else {
            if (this.vm.model.imagens.length >= 4) {
                this.messageService.add({ severity: 'warn', summary: 'Limite', detail: 'Máximo de 4 imagens.' });
                return;
            }
            this.vm.model.imagens.push(img);
        }
    }

    resetEstoqueTemp() {
        this.estoqueTemp = {
            quantidade: 0,
            preco: 0,
            status: StatusEnum.ATIVO
        };
    }

    adicionarEstoque() {
        if (!this.estoqueTemp.cor || !this.estoqueTemp.tamanho) {
            this.messageService.add({ severity: 'warn', summary: 'Dados incompletos', detail: 'Selecione Cor e Tamanho.' });
            return;
        }

        if (!this.vm.model.estoques) {
            this.vm.model.estoques = [];
        }

        const existe = this.vm.model.estoques.find((e) => e.cor?.id === this.estoqueTemp.cor?.id && e.tamanho?.id === this.estoqueTemp.tamanho?.id);

        if (existe) {
            this.messageService.add({ severity: 'error', summary: 'Duplicado', detail: 'Já existe um item com esta Cor e Tamanho.' });
            return;
        }

        // Correção do construtor: passando argumento para Partial, ou usando Object.assign se a classe não tiver construtor
        const novoItem = new ProdutoEstoque({
            ...this.estoqueTemp,
            produto: { id: this.vm.model.id } as any
        });

        this.vm.model.estoques.push(novoItem);
        this.resetEstoqueTemp();
    }

    removerEstoque(index: number) {
        this.vm.model.estoques?.splice(index, 1);
    }

    onInitNewRow(event: any) {
        event.data.status = StatusEnum.ATIVO;
        event.data.imagens = [];
        event.data.estoques = [];
        this.resetEstoqueTemp();
    }

    onLazyLoad(event: any) {
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        this.vm.filter.page = page;
        this.vm.filter.size = event.rows || 10;
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
}
