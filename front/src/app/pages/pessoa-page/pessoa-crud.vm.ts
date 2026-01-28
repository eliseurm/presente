import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Pessoa} from '@/shared/model/pessoa';
import {PessoaFilter} from '@/shared/model/filter/pessoa-filter';
import {PessoaService} from '@/services/pessoa.service';
import {StringUtils} from "@/shared/core/string-utils";
import {Observable, of} from "rxjs";
import {PageResponse} from "@/shared/model/page-response";
import {catchError, tap} from "rxjs/operators";
import {ToastMessageOptions} from "primeng/api";
import { Usuario } from '@/shared/model/usuario';

@Injectable()
export class PessoaCrudVM extends AbstractCrud<Pessoa, PessoaFilter> {
    constructor(port: PessoaService, route: ActivatedRoute, router: Router) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected newModel(): Pessoa {
        return new Pessoa();
    }

    protected newFilter(): PessoaFilter {
        return new PessoaFilter();
    }

    override doFilter(): Observable<PageResponse<Pessoa>> {
        const filtroComExpand = this.attachExpandToFilterIfNeeded();

        if (!filtroComExpand || (filtroComExpand && !filtroComExpand.clienteId)) {
            this.messageToastShow('Informe um Cliente');
            return of();
        }

        return this.port.listar(filtroComExpand).pipe(
            tap((resp) => {
                this.dataSource = resp.content;
                this.totalRecords = resp.page?.totalElements || 0;
                this.saveToStorage();
            }),
            catchError((err) => this.handleError<PageResponse<Pessoa>>(err, 'Falha ao carregar lista'))
        );
    }

    override canDoSave(): boolean {
        this.model.cpf = StringUtils.somenteNumeros(this.model.cpf);
        this.model.cep = StringUtils.somenteNumeros(this.model.cep);

        this.errorMessages = [];
        if (!this.model?.cliente) this.errorMessages.push('Informe o Cliente.');
        if (!(this.model?.nome && String(this.model.nome).trim().length > 0)) this.errorMessages.push('Informe o nome da pessoa.');
        if (!(this.model as any)?.cpf || !String((this.model as any).cpf).trim()) this.errorMessages.push('Informe o cpf da pessoa.');
        if (!(this.model as any)?.email || !String((this.model as any).email).trim()) this.errorMessages.push('Informe o e-mail da pessoa.');
        if (!(this.model as any)?.telefone || !String((this.model as any).telefone).trim()) this.errorMessages.push('Informe o telefone da pessoa.');
        if (!(this.model as any)?.status || !String((this.model as any).status).trim()) this.errorMessages.push('Informe o status deste cadastro.');

        const ok = this.errorMessages.length === 0;
        // if(!ok) {
        //     this.messageToastSubject.next(this.errorMessages);
        // }
        this.errorsVisible = true;
        return ok;
    }

    override doSave(): Observable<Pessoa> {
        const payload: any = { ...this.model } as any;
        payload.status = (this.model.status as any).key ?? (this.model.status as any).name ?? this.model.status;
        this.model = payload;

        return super.doSave();
    }
}
