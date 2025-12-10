import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CrudFilterComponent} from "@/shared/components/crud-filter/crud-filter.component";
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";
import {FilterField} from "@/shared/components/crud-filter/filter-field";
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {TamanhoService} from '../../services/tamanho.service';
import {Tamanho} from '../../shared/model/tamanho';
import {ProdutoTipoEnum} from '../../shared/model/enum/produto-tipo.enum';
import {TamanhoFilter} from "@/shared/model/filter/tamanho-filter";
import { CrudComponent } from '@/shared/crud/crud.component';
import { TamanhoCrudVM } from './tamanho-crud.vm';
import { ErmDataGridComponent, ErmColumnComponent, ErmTemplateDirective } from '@/shared/components/erm-data-grid';

@Component({
    selector: 'app-tamanho-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        CrudFilterComponent,
        EnumSelectComponent,
        CrudComponent,
        ErmDataGridComponent,
        ErmColumnComponent,
        ErmTemplateDirective
    ],
    providers: [MessageService, ConfirmationService, TamanhoCrudVM],
    templateUrl: './tamanho-page.component.html',
    styleUrls: ['./tamanho-page.component.scss']
})
@CrudMetadata("TamanhoPageComponent", [Tamanho, TamanhoFilter])
export class TamanhoPageComponent implements OnInit {

    @ViewChild('crudRef') crudRef?: CrudComponent<Tamanho, TamanhoFilter>;

    tipoProdutoEnumType: any = ProdutoTipoEnum;

    // Definição dos campos de filtro
    readonly filterFields: FilterField[] = [
        {
            key: 'tipo',
            label: 'Tipo de Produto',
            type: 'enum',
            placeholder: 'Selecione o tipo',
            enumObject: ProdutoTipoEnum,
            optionLabel: 'descricao'
        },
        {
            key: 'tamanho',
            label: 'Tamanho',
            type: 'text',
            placeholder: 'Buscar por tamanho'
        }
    ];

    constructor(
        public vm: TamanhoCrudVM,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private tamanhoService: TamanhoService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.vm.init();
    }

    // Modo lazy do PrimeNG: toda mudança de página/tamanho dispara este evento
    onLazyLoad(event: any) {
        // event.first = índice do primeiro registro da página atual
        // event.rows  = tamanho da página
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;

        this.vm.filter.page = page;
        this.vm.filter.size = size;

        // Se o componente suporta sort no evento, aplique aqui
        // Ordenação múltipla (quando habilitado no p-table) ou simples
        if (Array.isArray(event.multiSortMeta) && event.multiSortMeta.length) {
            this.vm.filter.sorts = event.multiSortMeta.map((m: any) => ({
                field: m.field,
                direction: m.order === 1 ? 'ASC' : 'DESC'
            }));
        } else if (event.sortField) {
            this.vm.filter.sorts = [{ field: event.sortField, direction: (event.sortOrder === 1 ? 'ASC' : 'DESC') }];
        }

        this.vm.doFilter().subscribe();
    }

    onClearFilters() {
        this.vm.resetFilter();
        this.vm.doFilter().subscribe();
    }

    onCloseCrud() {
        // Fecha a tela e volta para o Home (principal)
        this.router.navigate(['/']);
    }

    getTipoDescricao(tipo: any): string {
        if (!tipo) return '';
        if (typeof tipo === 'string') {
            const enumValue = Object.values(ProdutoTipoEnum).find((e: any) => (e as any).key === tipo) as any;
            return (enumValue as any)?.descricao || tipo;
        }
        return (tipo as any).descricao || (tipo as any).key || '';
    }
}
