import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';

import { PessoaService } from '@/services/pessoa.service';
import { Pessoa } from '@/shared/model/pessoa';
import { PessoaFilter } from '@/shared/model/filter/pessoa-filter';
import { FilterField } from '@/shared/components/crud-filter/filter-field';

import { CrudFilterComponent } from '@/shared/components/crud-filter/crud-filter.component';
import {CrudMetadata} from "@/shared/core/crud.metadata.decorator";
import { CrudComponent } from '@/shared/crud/crud.component';
import { TableModule } from 'primeng/table';
import { PessoaCrudVM } from './pessoa-crud.vm';
import { SelectModule } from 'primeng/select';

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
        SelectModule
    ],
    templateUrl: './pessoa-page.component.html',
    styleUrls: [
        '../../shared/components/crud-base/crud-base.component.scss',
        './pessoa-page.component.scss'
    ],
    providers: [MessageService, PessoaCrudVM]
})
@CrudMetadata("PessoaPageComponent", [Pessoa, PessoaFilter])
export class PessoaPageComponent  {

    @ViewChild('crudRef') crudRef?: CrudComponent<Pessoa, PessoaFilter>;

    readonly statusOptions = [
        { label: 'Ativo', value: 'ATIVO' },
        { label: 'Inativo', value: 'INATIVO' }
    ];

    readonly filterFields: FilterField[] = [
        { key: 'nome', label: 'Nome', type: 'text', placeholder: 'Filtrar por nome' },
        { key: 'email', label: 'E-mail', type: 'text', placeholder: 'Filtrar por e-mail' },
        { key: 'telefone', label: 'Telefone', type: 'text', placeholder: 'Filtrar por telefone' },
        { key: 'status', label: 'Status', type: 'select', placeholder: 'Selecione o status', options: [
                { label: 'Ativo', value: 'ATIVO' },
                { label: 'Inativo', value: 'INATIVO' }
            ] }
    ];

    constructor(
        public vm: PessoaCrudVM,
        private pessoaService: PessoaService,
        private messageService: MessageService,
        private router: Router,
        private http: HttpClient
    ) {}

    // CEP exibido com máscara; o modelo armazena apenas dígitos
    cepMask: string = '';

    ngOnInit(): void {
        this.vm.init();
        // Sincroniza máscara quando o modelo é recarregado
        this.vm.refreshModel.subscribe(() => {
            this.syncCepMaskFromModel();
        });
        this.syncCepMaskFromModel();
    }

    private syncCepMaskFromModel() {
        const cep = (this.vm.model as any)?.cep || '';
        const digits = this.onlyDigits(cep);
        this.cepMask = this.formatCep(digits);
        // Garante que o modelo fique sem máscara
        (this.vm.model as any).cep = digits || undefined;
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

    onDeleteRow(row: Pessoa) {
        const id = (row as any)?.id;
        if (!id) return;
        this.pessoaService.deletar(id).subscribe({
            next: () => { this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Excluída com sucesso` }); this.vm.doFilter().subscribe(); },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir pessoa' })
        });
    }

    onCloseCrud() { this.router.navigate(['/']); }

    // ===== CEP: máscara e ViaCep =====
    onCepInput(val: string) {
        const digits = this.onlyDigits(val).slice(0, 8);
        this.cepMask = this.formatCep(digits);
        (this.vm.model as any).cep = digits || undefined;
        if (digits.length === 8) {
            // Busca ViaCep ao completar 8 dígitos
            this.buscarViaCep(digits);
        }
    }

    onCepBlur() {
        const digits = this.onlyDigits(this.cepMask);
        if (digits.length === 8) {
            this.buscarViaCep(digits);
        }
    }

    private buscarViaCep(cepDigits: string) {
        this.http.get<any>(`https://viacep.com.br/ws/${cepDigits}/json/`).subscribe({
            next: (resp) => {
                if (resp?.erro) {
                    this.messageService.add({ severity: 'warn', summary: 'CEP inválido', detail: 'Não encontrado no ViaCep.' });
                    return;
                }
                // Preenche endereço, cidade e estado conforme resposta
                (this.vm.model as any).endereco = resp?.logradouro || (this.vm.model as any).endereco;
                (this.vm.model as any).cidade = resp?.localidade || (this.vm.model as any).cidade;
                (this.vm.model as any).estado = resp?.uf || (this.vm.model as any).estado;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao consultar ViaCep.' });
            }
        });
    }

    private onlyDigits(v: string | undefined | null): string {
        return (v || '').replace(/\D+/g, '');
    }

    private formatCep(digits: string): string {
        if (!digits) return '';
        const d = digits.substring(0, 8);
        if (d.length <= 5) return d;
        // 99.999-999
        return `${d.substring(0,2)}.${d.substring(2,5)}-${d.substring(5)}`;
    }
}
