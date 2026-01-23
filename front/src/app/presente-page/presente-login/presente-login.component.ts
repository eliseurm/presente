import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importante para navegação
import { debounceTime, distinctUntilChanged, switchMap, finalize, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { CardModule } from "primeng/card";
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from "primeng/api";
import { PresenteService } from "@/presente-page/presente.service";

@Component({
    selector: 'presente-login',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, ToastModule, ButtonModule,
        SelectModule, CardModule, InputTextModule, InputMaskModule
    ],
    templateUrl: './presente-login.component.html',
    styleUrls: ['./presente-login.component.scss'],
    providers: [MessageService]
})
export class PresenteLoginComponent implements OnInit {
    loginForm: FormGroup;
    loading: { [key: string]: boolean } = { nome: false, nascimento: false, cpf: false };
    valid: { [key: string]: boolean | null } = { nome: null, nascimento: null, cpf: null };
    loadingLogin = false;

    // Listas para os Dropdowns
    niveis1: any[] = [];
    niveis2: any[] = [];
    niveis3: any[] = [];

    constructor(
        private fb: FormBuilder,
        private presenteService: PresenteService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            organoNivel1: [null, Validators.required],
            organoNivel2: [null, Validators.required],
            organoNivel3: [null, Validators.required],
            nome: ['', [Validators.required, Validators.minLength(3)]],
            nascimento: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
            cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
        });
    }

    ngOnInit() {
        this.carregarNiveis();
        this.configurarValidacaoNome();
        this.configurarValidacaoFixa('cpf');
        this.configurarValidacaoFixa('nascimento');
    }

    carregarNiveis() {
        // Carrega Nível 1
        this.presenteService.getNiveis(1).subscribe(data => {
            this.niveis1 = data.map(item => ({ label: item, value: item }));
        });
        // Carrega Nível 2
        this.presenteService.getNiveis(2).subscribe(data => {
            this.niveis2 = data.map(item => ({ label: item, value: item }));
        });
        // Carrega Nível 3
        this.presenteService.getNiveis(3).subscribe(data => {
            this.niveis3 = data.map(item => ({ label: item, value: item }));
        });
    }

    private configurarValidacaoNome() {
        this.loginForm.get('nome')?.valueChanges.pipe(
            tap(() => this.valid['nome'] = null),
            debounceTime(800),
            distinctUntilChanged(),
            filter(v => v && v.length >= 3),
            switchMap(v => this.executarValidacao('nome', v))
        ).subscribe();
    }

    private configurarValidacaoFixa(campo: string) {
        this.loginForm.get(campo)?.valueChanges.pipe(
            tap(() => this.valid[campo] = null),
            distinctUntilChanged(),
            // Valida apenas se o mask estiver completo/válido no front
            filter(() => this.loginForm.get(campo)?.valid ?? false),
            switchMap(v => this.executarValidacao(campo, v))
        ).subscribe();
    }

    private executarValidacao(campo: string, valor: any) {
        this.loading[campo] = true;
        this.valid[campo] = null;

        return this.presenteService.validarDado(campo, valor).pipe(
            finalize(() => this.loading[campo] = false),
            switchMap(isValid => {
                this.valid[campo] = isValid;
                if (!isValid) {
                    this.loginForm.get(campo)?.setErrors({ notFound: true });
                } else {
                    // Se o back disse OK, remove erro 'notFound', mantendo outros se houver
                    const currentErrors = this.loginForm.get(campo)?.errors;
                    if (currentErrors) {
                        delete currentErrors['notFound'];
                        this.loginForm.get(campo)?.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
                    }
                }
                return of(isValid);
            })
        );
    }

    isCheckingAny(): boolean {
        return Object.values(this.loading).some(l => l) || this.loadingLogin;
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.messageService.add({severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos corretamente.'});
            return;
        }

        this.loadingLogin = true;
        const formValues = this.loginForm.value;

        // Chama o endpoint de login
        this.presenteService.login(formValues).pipe(
            finalize(() => this.loadingLogin = false)
        ).subscribe({
            next: (response) => {
                this.messageService.add({severity: 'success', summary: 'Bem-vindo!', detail: 'Acesso autorizado.'});

                // Redireciona para a página do presente usando o token retornado
                // Ex: /presente/TOKEN-XYZ-123
                setTimeout(() => {
                    this.router.navigate(['/presente', response.token]);
                }, 1000); // Um pequeno delay para o usuário ver o toast de sucesso
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro de Acesso',
                    detail: 'Dados não conferem com nosso cadastro.'
                });
            }
        });
    }
}
