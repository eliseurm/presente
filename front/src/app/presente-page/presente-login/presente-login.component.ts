import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Alterado para FormsModule
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { SelectChangeEvent, SelectModule } from "primeng/select";
import { CardModule } from "primeng/card";
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from "primeng/api";
import { PresenteService } from "@/presente-page/presente.service";
import { PresenteOrganogramaDto } from "@/shared/model/dto/presente-organograma-dto";

@Component({
    selector: 'presente-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule, // Importante: FormsModule aqui
        ToastModule,
        ButtonModule,
        SelectModule,
        CardModule,
        InputTextModule,
        InputMaskModule
    ],
    templateUrl: './presente-login.component.html',
    styleUrls: ['./presente-login.component.scss'],
    providers: [MessageService]
})
export class PresenteLoginComponent implements OnInit {
    // Objeto que armazena os dados do formulário (Two-way data binding)
    loginData = {
        organoNivel1: null,
        organoNivel2: null,
        organoNivel3: null,
        nome: '',
        nascimento: '',
        cpf: ''
    };

    loading: { [key: string]: boolean } = { nome: false, nascimento: false, cpf: false };
    valid: { [key: string]: boolean | null } = { organoNivel1: null, organoNivel2: null, organoNivel3: null, nome: null, nascimento: null, cpf: null };
    loadingLogin = false;

    organogramaList: PresenteOrganogramaDto[] = [];
    niveis1: any[] = [];
    niveis2: any[] = [];
    niveis3: any[] = [];

    constructor(
        private presenteService: PresenteService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.carregarOrganograma();
    }

    // Lógica de validação disparada pelo evento (ngModelChange)
    onFieldChange(campo: string) {
        return;

/*
        const valor = (this.loginData as any)[campo];

        if (!valor || valor === '') {
            this.valid[campo] = null;
            return;
        }

        // 1. Validação de tamanho/formato antes de ir ao Back
        if (campo === 'nome' && valor.length < 3) {
            this.valid[campo] = false;
            return;
        }

        // Verifica se a máscara do PrimeNG está completa (não contém underlines)
        if ((campo === 'cpf' || campo === 'nascimento') && valor.includes('_')) {
            this.valid[campo] = false;
            return;
        }

        // 2. Se passou no front, valida no Back-end via Service
        this.loading[campo] = true;
        this.valid[campo] = null;

        this.presenteService.validarDado(campo, valor).pipe(
                finalize(() => this.loading[campo] = false)
            )
            .subscribe({
                next: (isValid) => this.valid[campo] = isValid,
                error: () => this.valid[campo] = false
        });
*/
    }

    carregarOrganograma() {
        this.presenteService.getOrganograma().subscribe(data => {
            this.organogramaList = data;
            const list = this.getNivel1();
            this.niveis1 = list.map(item => ({label: item, value: item}));
        });
    }

    onSubmit(form: any) {
        // 1. Validar se todos os campos estão preenchidos (Obrigatoriedade)
        if (form.invalid) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.' });
            return;
        }

        if (!this.loginData.organoNivel1 || !this.loginData.organoNivel2 || !this.loginData.organoNivel3) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Organograma Incompleto',
                detail: 'Selecione todos os níveis da sua União/Associação.'
            });
            return;
        }

        const { nome, nascimento, cpf } = this.loginData;

        // 2. Validar se tem pelo menos dois nomes (Nome e Sobrenome)
        const partesNome = nome.trim().split(/\s+/);
        if (partesNome.length < 2) {
            this.valid['nome'] = false;
            this.messageService.add({ severity: 'error', summary: 'Nome Inválido', detail: 'Informe seu nome completo (Nome e Sobrenome).' });
            return;
        }

        // 3. Validar Data (O formato já é garantido pela máscara, mas verificamos a validade real)
        if (!this.isValidDate(nascimento)) {
            this.valid['nascimento'] = false;
            this.messageService.add({ severity: 'error', summary: 'Data Inválida', detail: 'Informe uma data de nascimento válida.' });
            return;
        }

        // 4. Validar Algoritmo de CPF
        if (!this.validarCPF(cpf)) {
            this.valid['cpf'] = false;
            this.messageService.add({ severity: 'error', summary: 'CPF Inválido', detail: 'O CPF informado não é válido.' });
            return;
        }

        // 5. Se passou em tudo, envia para o Back-end
        this.loadingLogin = true;
        this.presenteService.realizarLogin(this.loginData).pipe(
            finalize(() => this.loadingLogin = false)
        ).subscribe({
            next: (response) => {
                this.messageService.add({ severity: 'success', summary: 'Bem-vindo!', detail: 'Acesso autorizado.' });
                setTimeout(() => {
                    this.router.navigate(['/presente', response.token]);
                }, 1000);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Erro de Acesso', detail: 'Os dados informados não conferem com nossos registros ativos.' });
            }
        });
    }

    // Auxiliar: Validação de Data Real
    private isValidDate(dateStr: string): boolean {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return false;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    }

    // Auxiliar: Algoritmo de CPF
    private validarCPF(cpf: string): boolean {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        return resto === parseInt(cpf.substring(10, 11));
    }

    private getNivel1() {
        return [...new Set(this.organogramaList.map(item => item.nivel1))];
    }

    filtrarNiveis2(event: SelectChangeEvent) {
        const filtrados = this.organogramaList.filter(item => item.nivel1 === event.value);
        this.niveis2 = [...new Set(filtrados.map(i => i.nivel2))].map(v => ({label: v, value: v}));
        this.niveis3 = [];
        this.loginData.organoNivel2 = null;
        this.loginData.organoNivel3 = null;
    }

    filtrarNiveis3(event: SelectChangeEvent) {
        const filtrados = this.organogramaList.filter(item =>
            item.nivel1 === this.loginData.organoNivel1 && item.nivel2 === event.value
        );
        this.niveis3 = [...new Set(filtrados.map(i => i.nivel3))].map(v => ({label: v, value: v}));
        this.loginData.organoNivel3 = null;
    }

    isCheckingAny(): boolean {
        return Object.values(this.loading).some(l => l) || this.loadingLogin;
    }
}
