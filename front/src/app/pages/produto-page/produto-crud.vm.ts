import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Produto} from '@/shared/model/produto';
import {ProdutoFilter} from '@/shared/model/filter/produto-filter';
import {ProdutoService} from '@/services/produto.service';
import {Observable} from 'rxjs';
import {Mode} from "@/shared/crud/crud.mode";

@Injectable()
export class ProdutoCrudVM extends AbstractCrud<Produto, ProdutoFilter> {
    constructor(
        port: ProdutoService,
        route: ActivatedRoute,
        router: Router,
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected newModel(): Produto {
        return {
            id: undefined,
            nome: '',
            descricao: '',
            preco: undefined as any,
            status: true,
            cores: [],
            tamanhos: [],
            imagens: [],
            version: undefined,
        } as unknown as Produto;
    }

    protected newFilter(): ProdutoFilter {
        return new ProdutoFilter();
    }

    override onRowOpen(row: Produto): void {

        const id = row && (row as any).id;
        this.mode = Mode.Edit;
        this.model = row;
        this.refreshModel.next();

        if (id != null) {
            this.port.getById(id, this.getExpandParam()).subscribe({
                next: (m) => {
                    this.verifyAndLockRegistry(m).subscribe({
                        next: (locked) => {
                            this.model = locked;
                            this.refreshModel.next();
                        },
                        error: (e) => this.handleError(e, 'Falha ao bloquear registro')
                    });
                },
                error: (e) => this.handleError(e, 'Falha ao carregar registro')
            });
        }
        else {
            // fallback: sem ID, usa o próprio objeto
        }
    }


    override canDoSave(): boolean {
        const ok = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
        this.errorsVisible = !ok;
        this.errorMessages = ok ? [] : ['Informe o nome do produto.'];
        return ok;
    }

    // Normaliza associações (enviar apenas IDs) antes de salvar
    override doSave(): Observable<Produto> {
        const mapToIds = (arr?: any[]) => (arr || []).filter(x => !!x).map((x: any) => ({id: typeof x === 'object' ? x.id : x}));
        const payload: any = {
            ...this.model,
            cores: mapToIds((this.model as any).cores),
            tamanhos: mapToIds((this.model as any).tamanhos),
            imagens: mapToIds((this.model as any).imagens),
        };
        this.model = payload;
        return super.doSave();
    }

}
