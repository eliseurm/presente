import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Cliente} from '@/shared/model/cliente';
import {ClienteFilter} from '@/shared/model/filter/cliente-filter';
import {ClienteService} from '@/services/cliente.service';
import {AuthService} from '@/pages/auth/auth-service';
import {Observable, of} from 'rxjs';
import {PageResponse} from '@/shared/model/page-response';

@Injectable()
export class ClienteCrudVM extends AbstractCrud<Cliente, ClienteFilter> {
    constructor(
        port: ClienteService,
        route: ActivatedRoute,
        router: Router,
        private auth: AuthService,
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected newModel(): Cliente {
        return {
            id: undefined,
            nome: '',
            email: '',
            telefone: '',
            usuario: undefined as any,
            anotacoes: '',
            version: undefined,
        } as unknown as Cliente;
    }

    protected newFilter(): ClienteFilter {
        return new ClienteFilter();
    }

    override canDoSave(): boolean {
        const errors: string[] = [];
        if (!(this.model?.nome && String(this.model.nome).trim().length > 0)) errors.push('Informe o nome do cliente.');
        if (!(this.model?.email && String(this.model.email).trim().length > 0)) errors.push('Informe o email.');
        if (!(this.model?.telefone && String(this.model.telefone).trim().length > 0)) errors.push('Informe o telefone.');

        this.errorMessages = errors;
        this.errorsVisible = errors.length > 0;
        return errors.length === 0;
    }

    override doSave() {
        // CLIENTE só pode editar Nome; não pode criar
        if (this.auth.isCliente()) {
            const id = (this.model as any)?.id;
            if (!id) {
                // bloqueia criação
                this.errorsVisible = true;
                this.errorMessages = ['Ação não permitida: CLIENTE não pode criar clientes.'];
                // Retorna observable vazio para compatibilidade
                return of(undefined as any);
            }
            // const payload: any = {id, nome: (this.model as any)?.nome, status: (this.model as any)?.['status']};
            // this.model = payload;
            return super.doSave();
        }

        // ADMIN mantém comportamento completo
        const payload: any = {...this.model} as any;
        const u = (this.model as any)?.usuario;
        if (u) {
            const id = typeof u === 'object' ? u.id : u;
            payload.usuario = id ? {id} : null;
        }
        this.model = payload;
        return super.doSave();
    }

    // CLIENTE não pode listar globalmente: usa /cliente/me e adapta o PageResponse para a grid
    override doFilter(): Observable<PageResponse<Cliente>> {
        if (this.auth.isCliente()) {
            return new Observable<PageResponse<Cliente>>((subscriber) => {
                (this.port as ClienteService).getMe().subscribe({
                    next: (list) => {
                        const page: PageResponse<Cliente> = {
                            content: list || [],
                            totalElements: (list || []).length,
                            totalPages: 1,
                            number: 0,
                            size: (list || []).length,
                            first: true,
                            last: true,
                            numberOfElements: (list || []).length,
                        } as any;
                        this.dataSource = page.content;
                        this.totalRecords = page.totalElements;
                        this.saveToStorage();
                        subscriber.next(page);
                        subscriber.complete();
                    },
                    error: (err) => {
                        // Delega tratamento ao handler base
                        const empty = {content: [], totalElements: 0} as any as PageResponse<Cliente>;
                        subscriber.next(empty);
                        subscriber.complete();
                    }
                });
            });
        }
        return super.doFilter();
    }

    // CLIENTE não pode criar novos clientes
    override doCreateNew(): void {
        if (this.auth.isCliente()) {
            // Bloqueia criação para CLIENTE
            this.errorsVisible = true;
            this.errorMessages = ['Ação não permitida para seu perfil (CLIENTE).'];
            return;
        }
        super.doCreateNew();
    }

    // CLIENTE não pode excluir clientes
    override doRemove(idOrModel: any): Observable<void> {
        if (this.auth.isCliente()) {
            this.errorsVisible = true;
            this.errorMessages = ['Ação não permitida para seu perfil (CLIENTE).'];
            // Retorna observable vazio para manter contrato
            return new Observable<void>((subscriber) => {
                subscriber.complete();
            });
        }
        return super.doRemove(idOrModel);
    }
}
