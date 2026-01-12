import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Observable, of, map} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {CrudPort} from '@/shared/services/crud-port';
import {Mode} from '@/shared/crud/crud.mode';
import {PageResponse} from '@/shared/model/page-response';
import {BaseFilter} from '@/shared/model/core/base-filter';
import {stringify as flattedStringify, parse as flattedParse} from 'flatted';
import {Evento} from "@/shared/model/evento";
import {EventoMapper} from "@/shared/model/mapper/evento-mapper";
import {EventoProduto} from "@/shared/model/evento-produto";

export abstract class AbstractCrud<T extends { id?: any; version?: number }, F extends BaseFilter> {

    // Estado base
    model!: T;
    filter!: F;
    dataSource: T[] = [];
    mode: Mode = Mode.List;

    // Mensagens/erros
    errorsVisible = false;
    errorMessages: any[] = [];
    registryUnlocked = true;
    totalRecords = 0;

    // Observables
    refreshModel = new Subject<void>();
    filterSubject = new Subject<F>();
    listGridSelectionSubject = new Subject<T | T[]>();
    messageToastSubject = new Subject<any[]>();

    protected storage: Storage = sessionStorage;

    // Expand genérico (desabilitado por padrão)
    protected useExpand = false;
    protected expandFields: string[] = [];

    protected constructor(
        protected port: CrudPort<T, F>,
        protected route?: ActivatedRoute,
        protected router?: Router,
    ) {
    }

    // Inicialização
    init(): void {
        this.newModelIfNull();
        this.newFilterIfNull();
        this.loadFromStorage();
        const id = this.route?.snapshot.paramMap.get('id');
        if (id) {
            this.onIdParam(id);
        }
        else {
            // Nao vou carregar o filtro ao iniciar, porque a e-data-grid ja faz isso no evento onLazyLoad
            // this.doFilter().subscribe();
        }
    }

    // CRUD
    doFilter(): Observable<PageResponse<T>> {
        // aplica expand opcionalmente sem poluir o filtro persistido
        const filtroComExpand = this.attachExpandToFilterIfNeeded();
        return this.port.listar(filtroComExpand).pipe(
            tap((page) => {
                this.dataSource = page.content;
                this.totalRecords = page.totalElements;
                this.saveToStorage();
            }),
            catchError((err) => this.handleError<PageResponse<T>>(err, 'Falha ao carregar lista'))
        );
    }

    doSave(): Observable<T> {
        return this.port.salvar(this.model).pipe(
            tap((saved) => {
                this.model = saved;
                this.onSaveSuccess();
            }),
            catchError((err) => this.handleError<T>(err, 'Falha ao salvar registro'))
        );
    }

    doRemove(idOrModel: any): Observable<void> {
        const id = typeof idOrModel === 'object' ? idOrModel.id : idOrModel;
        return this.port.excluir(id).pipe(
            tap(() => this.onRemoveSuccess()),
            catchError((err) => this.handleError<void>(err, 'Falha ao excluir registro'))
        );
    }

    doCreateNew(): void {
        // Garante um novo objeto limpo, evitando referências residuais do model anterior
        this.model = this.newModel();
        try {
            // Força remoção de identificadores residuais em casos de modelos parciais
            if ((this.model as any)?.id !== undefined) (this.model as any).id = undefined;
            if ((this.model as any)?.version !== undefined) (this.model as any).version = undefined;
        } catch {
        }

        // Se a rota atual possui :id, remove-o da URL para evitar reidratação posterior pelo parâmetro
        try {
            const currentId = this.route?.snapshot.paramMap.get('id');
            if (currentId && this.router) {
                const path = (this.router.url || '').split('?')[0];
                const segments = path.split('/').filter(Boolean);
                if (segments.length > 0) {
                    // Remove o último segmento se for o próprio id
                    const last = segments[segments.length - 1];
                    if (last === currentId) {
                        segments.pop();
                        this.router.navigate(['/' + segments.join('/')]);
                    }
                }
            }
        } catch {
        }
        // Limpa estados de erro do formulário
        this.errorsVisible = false;
        this.errorMessages = [];
        this.mode = Mode.Edit;
        this.refreshModel.next();
    }

    doCancel(): void {
        this.mode = Mode.List;
        this.errorsVisible = false;
    }

    canDoSave(): boolean {
        return true;
    }

    // // Rotas / Edição por ID
    onIdParam(id: string | number): void {
        this.callGetByIdService(id).subscribe({
            next: (m) => {
                this.verifyAndLockRegistry(m).subscribe({
                    next: (locked) => {
                        this.model = locked;
                        this.mode = Mode.Edit;
                        this.refreshModel.next();
                    },
                    error: (e) => this.handleError(e, 'Falha ao bloquear registro')
                });
            },
            error: (e) => this.handleError(e, 'Falha ao carregar registro')
        });
    }

    protected callGetByIdService(id: any): Observable<T> {
        return this.port.getById(id, this.getExpandParam());
    }

    // Permite ao componente chamar abertura de linha de forma uniforme e com suporte a expand
    onRowOpen(row: T): void {
        const id = row && (row as any).id;
        this.mode = Mode.Edit;
        this.model = row;
        this.refreshModel.next();

        // if (id != null) {
        //     this.port.getById(id, this.getExpandParam()).subscribe({
        //         next: (m) => {
        //             this.verifyAndLockRegistry(m).subscribe({
        //                 next: (locked) => {
        //                     this.model = locked;
        //                     this.refreshModel.next();
        //                 },
        //                 error: (e) => this.handleError(e, 'Falha ao bloquear registro')
        //             });
        //         },
        //         error: (e) => this.handleError(e, 'Falha ao carregar registro')
        //     });
        // }
        // else {
        //     // fallback: sem ID, usa o próprio objeto
        // }
    }

    // Substitua (overload) este metodo caso precise checar alguma coisa antes, coisas como, bloquear se um cliente nao puder editar/ver
    protected verifyAndLockRegistry(m: T): Observable<T> {
        return of(m);
    }

    // Factories
    protected newModelIfNull(): void {
        if (!this.model) {
            this.model = this.newModel();
        }
    }

    protected newFilterIfNull(): void {
        if (!this.filter) {
            this.filter = this.newFilter();
        }
    }

    protected abstract newModel(): T;

    protected abstract newFilter(): F;

    // Storage
    protected saveToStorage(): void {
        try {
            // usa flatted para maior resiliência
            this.storage.setItem(this.storageKey('filter'), flattedStringify(this.filter));
        } catch {
        }
    }

    protected loadFromStorage(): void {
        try {
            const val = this.storage.getItem(this.storageKey('filter'));
            if (val) this.filter = Object.assign(this.newFilter(), flattedParse(val));
        } catch {
        }
    }

    protected storageKey(suffix: string): string {
        const segment = (this.router?.url || 'crud').split('?')[0];
        return `${segment}:${suffix}`;
    }

    // Hooks de sucesso/erro
    protected onSaveSuccess(): void {
        this.mode = Mode.List;
        this.doFilter().subscribe();
    }

    protected onRemoveSuccess(): void {
        // Após excluir, volta para a listagem e limpa o modelo atual
        this.mode = Mode.List;
        try {
            this.model = this.newModel();
        } catch {
        }
        this.errorsVisible = false;
        this.doFilter().subscribe();
    }

    protected handleError<R>(err: any, fallbackMsg: string): Observable<R> {
        const msg = this.normalizeError(err) || fallbackMsg;
        this.errorMessages = [msg];
        this.errorsVisible = true;
        return of(undefined as unknown as R);
    }

    protected normalizeError(e: any): string {
        // Prioriza mensagem do backend
        const backendMessage = e?.error?.message || e?.error?.error;
        const errors = e?.error?.errors;

        // 🎯 Caso ideal: erro estruturado vindo do backend
        if (backendMessage && Array.isArray(errors) && errors.length > 0) {
            const lines: string[] = [];

            lines.push(backendMessage);

            const limit = Math.min(errors.length, 3);

            for (let i = 0; i < limit; i++) {
                const field = errors[i]?.field ?? 'campo';
                const msg =
                    errors[i]?.error ||
                    errors[i]?.message ||
                    'inválido';

                lines.push(`${field}: ${msg}`);
            }

            if (errors.length > 3) {
                lines.push('continua..');
            }

            // emite mensagens para messageToast
            this.messageToastShow(lines);

            return lines.join('\n');
        }

        // 🔹 Apenas mensagem do backend
        if (backendMessage) {
            return backendMessage;
        }

        // Trata por status
        const status = e?.status;
        if (status === 0) return 'Falha de conexão. Verifique sua rede e tente novamente.';
        if (status === 400) return 'Requisição inválida. Verifique os dados informados.';
        if (status === 401) return 'Não autorizado. Faça login novamente.';
        if (status === 403) return 'Acesso negado para esta operação.';
        if (status === 404) return 'Registro não encontrado.';
        if (status === 409) return 'Registro alterado por outro usuário. Atualize a tela e tente novamente.';
        if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';
        const msg = e?.message || '';
        // Evita exibir a mensagem técnica do HttpClient completa
        if (msg && msg.startsWith('Http failure response')) return '';
        return msg;
    }

    // Expand helpers
    protected getExpandParam(): string | string[] | undefined {
        if (!this.useExpand) return undefined;
        if (this.expandFields && this.expandFields.length > 0) return this.expandFields;
        return undefined; // habilitado, mas sem campos definidos
    }

    protected attachExpandToFilterIfNeeded(): F {
        const expand = this.getExpandParam();
        if (expand) {
            const f: any = {...(this.filter as any), expand};
            return f as F;
        }
        return this.filter;
    }

    // API pública para consumidores habilitarem/desabilitarem expand
    public enableExpand(fields?: string[]): void {
        this.useExpand = true;
        this.expandFields = fields || [];
    }

    public disableExpand(): void {
        this.useExpand = false;
        this.expandFields = [];
    }

    public messageToastShow(erros: any[] | any){
        this.messageToastSubject.next(erros)
    }

}
