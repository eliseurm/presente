import {ActivatedRoute, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Tamanho} from '@/shared/model/tamanho';
import {TamanhoFilter} from '@/shared/model/filter/tamanho-filter';
import {TamanhoService} from '@/services/tamanho.service';
import {Observable} from 'rxjs';
import {ProdutoTipoEnum} from '@/shared/model/enum/produto-tipo.enum';

@Injectable()
export class TamanhoCrudVM extends AbstractCrud<Tamanho, TamanhoFilter> {

    constructor(
        port: TamanhoService,
        route: ActivatedRoute,
        router: Router,
    ) {
        super(port, route, router);
        // Inicializa defaults imediatamente
        this.model = this.newModel();
        this.filter = this.newFilter();

        // Quando entrar em modo de edição (via dblclick ou rota /:id),
        // garanta que o campo 'tipo' esteja no formato esperado pelo enum-select (objeto do enum)
        this.refreshModel.subscribe(() => {
            const atual = (this.model as any)?.tipo;
            (this.model as any).tipo = this.toEnumObject(atual);
        });
    }

    protected newModel(): Tamanho {
        return {
            id: undefined,
            tamanho: '',
            tipo: undefined,
            version: undefined,
        };
    }

    protected newFilter(): TamanhoFilter {
        let filter = new TamanhoFilter();
        filter.sorts = [
            { field: 'tipo', direction: 'ASC' },
            { field: 'tamanho', direction: 'ASC' }
        ];
        return filter;
    }

    override canDoSave(): boolean {
        return !!(this.model && this.model.tamanho && String(this.model.tamanho).trim().length > 0 && this.model.tipo);
    }

    // Permite ao consumidor recriar o filtro mantendo os defaults
    resetFilter(): void {
        this.filter = this.newFilter();
    }

    // Converte um valor vindo do select (objeto ou string) na KEY exata do enum do backend
    private toEnumKey(value: any): string | undefined {
        if (!value) return undefined;
        if (typeof value === 'string') {
            // já é uma key ou possivelmente a descricao; preferimos key exata
            const encontrado = (Object.values(ProdutoTipoEnum) as any[])
                    .find(v => v.key === value) ||
                (Object.values(ProdutoTipoEnum) as any[]).find(v => (v.descricao || '').toLowerCase() === value.toLowerCase());
            return encontrado?.key;
        }
        if (typeof value === 'object') {
            return value.key ?? undefined;
        }
        return undefined;
    }

    // Mapeia de string (key/descricao) para o objeto do enum usado pelo enum-select
    private toEnumObject(value: any): any {
        if (!value) return null;
        if (typeof value === 'object' && value.key) return value; // já é objeto esperado
        const valores = Object.values(ProdutoTipoEnum) as any[];
        if (typeof value === 'string') {
            return valores.find(v => v.key === value) ||
                valores.find(v => (v.descricao || '').toLowerCase() === value.toLowerCase()) || null;
        }
        return null;
    }

    // Normaliza o payload antes de salvar para alinhar com o backend (EnumType.STRING) e tratamento de version
    override doSave(): Observable<Tamanho> {
        const isCreate = !(this.model?.id);
        const payload: any = {...this.model};
        payload.tipo = this.toEnumKey(payload.tipo);
        if (isCreate) {
            // Evita enviar version no create
            delete payload.version;
        }
        // Atualiza o model local para o payload normalizado antes de chamar o núcleo
        this.model = payload;
        return super.doSave();
    }
}
