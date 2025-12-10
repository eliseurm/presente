import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Pessoa} from '@/shared/model/pessoa';
import {PessoaFilter} from '@/shared/model/filter/pessoa-filter';
import {PessoaService} from '@/services/pessoa.service';

@Injectable()
export class PessoaCrudVM extends AbstractCrud<Pessoa, PessoaFilter> {

    constructor(
        port: PessoaService,
        route: ActivatedRoute,
        router: Router,
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected newModel(): Pessoa {
        return {
            id: undefined,
            nome: '',
            email: '',
            telefone: '',
            status: 'ATIVO' as any,
            version: undefined,
        } as unknown as Pessoa;
    }

    protected newFilter(): PessoaFilter {
    return new PessoaFilter({ page: 0, size: 10, sorts: [{ field: 'id', direction: 'ASC' }] } as any);
  }

    override canDoSave(): boolean {
        const errors: string[] = [];
        if (!(this.model?.nome && String(this.model.nome).trim().length > 0)) errors.push('Informe o nome da pessoa.');
        if (!(this.model as any)?.email || !String((this.model as any).email).trim()) errors.push('Informe o e-mail da pessoa.');
        this.errorMessages = errors;
        this.errorsVisible = errors.length > 0;
        return errors.length === 0;
    }
}
