import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ToastModule} from 'primeng/toast';
import {HttpClient} from '@angular/common/http';

import {PessoaService} from '@/services/pessoa.service';
import {Pessoa} from '@/shared/model/pessoa';
import {PessoaFilter} from '@/shared/model/filter/pessoa-filter';
import {FilterField} from '@/shared/components/crud-filter/filter-field';

import {CrudFilterComponent} from '@/shared/components/crud-filter/crud-filter.component';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import {CrudComponent} from '@/shared/crud/crud.component';
import {TableModule} from 'primeng/table';
import {ErmColumnComponent, ErmDataGridComponent, ErmTemplateDirective} from '@/shared/components/erm-data-grid';
import {PessoaCrudVM} from './pessoa-crud.vm';
import {SelectModule} from 'primeng/select';
import {ProdutoTipoEnum} from "@/shared/model/enum/produto-tipo.enum";
import {StatusEnum} from "@/shared/model/enum/status.enum";
import {EventoFilter} from "@/shared/model/filter/evento-filter";
import {ClienteService} from "@/services/cliente.service";
import {Cliente} from "@/shared/model/cliente";
import {InputMask} from "primeng/inputmask";
import {firstValueFrom} from "rxjs";
import {StringUtils} from "@/shared/core/string-utils";
import {CrudBaseComponent} from "@/shared/components/crud-base/crud-base.component";
import {EnumSelectComponent} from "@/shared/components/enum-select/enum-select.component";

@Component({
    selector: 'pessoa-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        CrudFilterComponent,
        CrudComponent,
        TableModule,
        SelectModule,
        ErmDataGridComponent,
        ErmColumnComponent,
        ErmTemplateDirective,
        InputMask,
        EnumSelectComponent
    ],
    templateUrl: './pessoa-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './pessoa-page.component.scss'
    ],
    providers: [MessageService, PessoaCrudVM]
})
@CrudMetadata("PessoaPageComponent", [Pessoa, PessoaFilter])
export class PessoaPageComponent extends CrudBaseComponent<Pessoa, PessoaFilter>{

    // @ViewChild('crudRef') crudRef?: CrudComponent<Pessoa, PessoaFilter>;

    // Opções
    clientesOptions: Cliente[] = [];

    statusEnumType: any = StatusEnum;

    isValidCpf: boolean = true;
    isValidCep: boolean = true;

    readonly filterFields: FilterField[] = [
        {key: 'clienteId', label: 'Cliente', type: 'select', options: []},
        {key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome'},
        {key: 'email', label: 'E-mail', type: 'text', placeholder: 'Filtrar por e-mail'},
        {key: 'telefone', label: 'Telefone', type: 'text', placeholder: 'Filtrar por telefone'},
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            placeholder: 'Selecione o status',
            options: (Object.values(StatusEnum) as any[]).map((s: any) => ({
                label: String(s.descricao ?? s.key),
                value: s.key
            }))
        }
    ];

    constructor(
        messageService: MessageService,
        vm: PessoaCrudVM,
        private pessoaService: PessoaService,
        private clienteService: ClienteService,
        private router: Router,
        private http: HttpClient
    ) {
        super(messageService, vm);
        // this.messageSubject = this.vm.messageSubject;
    }


    override ngOnInit(): void {
        super.ngOnInit();
        this.vm.init();
        this.carregarOpcoes();
    }

    onLazyLoad(event: any) {
        const page = Math.floor((event.first || 0) / (event.rows || this.vm.filter.size || 10));
        const size = event.rows || this.vm.filter.size || 10;
        this.vm.filter.page = page;
        this.vm.filter.size = size;
        this.vm.filter.order = ['id,asc'];
        this.vm.doFilter().subscribe();
    }

    onClearFilters() {
        this.vm.filter = this.vm['newFilter']();
        this.vm.doFilter().subscribe();
    }

    onDeleteRow(row: Pessoa) {
        const id = (row as any)?.id;
        if (!id) return;
        this.pessoaService.deletar(id).subscribe({
            next: () => {
                this.messageToastAddAndShow('Excluída com sucesso', 'Sucesso', 'success');
                this.vm.doFilter().subscribe();
            },
            error: () => {
                this.messageToastAddAndShow('Erro ao excluir pessoa', 'Erro', 'error');
            }
        });
    }

    onCloseCrud() {
        this.router.navigate(['/']);
    }

    onBlurCpf(event: any) {
        this.isValidCpf = false;
        if (event && event.target) {
            this.isValidCpf = StringUtils.validarCPF(event.target.value);
        }
    }

    async onBlurCep(event: any) {
        this.isValidCep = false;
        if (event && event.target) {
            const digits = StringUtils.somenteNumeros(event.target.value).slice(0, 8);
            if (digits.length === 8) {
                (this.vm.model as any).cep = digits || undefined;
                const resp = await this.buscarViaCep(digits);

                if (resp?.erro) {
                    this.messageToastAddAndShow('Não encontrado no ViaCep.', 'CEP invalido', 'error');
                }
                // Preenche endereço, cidade e estado conforme resposta
                (this.vm.model as any).endereco = resp?.logradouro ?? (this.vm.model as any).endereco;
                (this.vm.model as any).cidade = resp?.localidade ?? (this.vm.model as any).cidade;
                (this.vm.model as any).estado = resp?.uf ?? (this.vm.model as any).estado;

                this.isValidCep = true;
            }
        }
    }

    private carregarOpcoes(): void {
        const base: any = new EventoFilter();
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
                        try {
                            this.vm.doFilter().subscribe();
                        } catch {
                        }
                    }
                }

                // Atualiza opções do filtro Cliente
                const idx = this.filterFields.findIndex(f => f.key === 'clienteId');
                if (idx >= 0) {
                    this.filterFields[idx] = {
                        ...this.filterFields[idx],
                        options: this.clientesOptions.map(c => {
                            return {
                                label: c?.nome ?? String(c?.id ?? ''),
                                value: c?.id
                            };
                        })
                    };
                }
            },
            error: _ => {
                // 403 aqui indicará que o token não possui papel/escopo; mostrar aviso
                this.messageToastAddAndShow('Não foi possível carregar seus clientes (acesso negado).', 'Erro', 'error');
            }
        });

    }

    private async buscarViaCep(cepDigits: string): Promise<any> {
        try {
            return await firstValueFrom(this.http.get<any>(`https://viacep.com.br/ws/${cepDigits}/json/`));

        }
        catch (error) {
            this.messageToastAddAndShow('Falha ao consultar ViaCep.', 'Erro', 'error')
        }
    }

}
