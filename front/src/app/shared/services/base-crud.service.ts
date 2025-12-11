import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseFilter } from '@/shared/model/filter/base-filter';
import { PageResponse } from '@/shared/model/page-response';
import { CrudPort } from '@/shared/services/crud-port';

// Classe base de serviços CRUD no front-end que implementa o contrato CrudPort
export abstract class BaseCrudService<T extends { id?: any; version?: number }, F extends BaseFilter> implements CrudPort<T, F> {
    protected abstract apiUrl: string;

    constructor(protected http: HttpClient) {}

    listar(filtro: F): Observable<PageResponse<T>> {
        const params = this.buildParams(filtro);
        return this.http.get<PageResponse<T>>(this.apiUrl, { params });
    }

    // Mantém compatibilidade com serviços existentes
    buscarPorId(id: number): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${id}`);
    }

    criar(entidade: T): Observable<T> {
        return this.http.post<T>(this.apiUrl, entidade);
    }

    atualizar(id: number, entidade: T): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}/${id}`, entidade);
    }

    deletar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    deletarEmLote(ids: number[]): Observable<{ total: number; deletados: number }> {
        return this.http.request<{ total: number; deletados: number }>(
            'delete',
            `${this.apiUrl}/batch`,
            { body: ids }
        );
    }

    // Implementação do CrudPort (wrappers padronizados)
    getById(id: any, expand?: string | string[]): Observable<T> {
        const params: any = {};
        if (expand && (Array.isArray(expand) ? expand.length > 0 : String(expand).trim().length > 0)) {
            params['expand'] = Array.isArray(expand) ? expand.join(',') : expand;
        }
        return this.http.get<T>(`${this.apiUrl}/${id}`, { params });
    }

    salvar(model: T): Observable<T> {
        const hasId = model?.id != null;
        return hasId ? this.atualizar(model.id, model) : this.criar(model);
    }

    excluir(id: any): Observable<void> {
        return this.deletar(id);
    }

    protected buildParams(filtro: F): any {
        const params: any = {};

        // Adiciona parâmetros de paginação e ordenação
        if (filtro.page !== undefined) params['page'] = filtro.page.toString();
        if (filtro.size !== undefined) params['size'] = filtro.size.toString();
        // Nova estratégia: múltiplas ordenações via filtro.sorts → vários parâmetros sort=field,dir
        const anyFiltro: any = filtro as any;
        if (Array.isArray((filtro as any).sorts) && (filtro as any).sorts.length > 0) {
            const sorts = (filtro as any).sorts as { field: string; direction?: 'ASC' | 'DESC' }[];
            // Angular HttpClient aceita params repetidos se usarmos HttpParams; aqui devolvemos objeto simples.
            // Consumidor (listar) usa HttpClient com { params } e o Angular serializa arrays como sort= & sort=
            params['sorts'] = sorts.map(s => `${s.field},${(s.direction || 'ASC').toLowerCase()}`);
        } else {
            // Compatibilidade retroativa: ainda aceitar sort/direction simples se enviados
            if (anyFiltro.sort) {
                const dir = (anyFiltro.direction || 'ASC').toLowerCase();
                params['sorts'] = [`${anyFiltro.sort},${dir}`];
            }
        }

        // Adiciona outros filtros
        Object.keys(filtro).forEach(key => {
            if (!['page', 'size', 'sort', 'direction', 'sorts'].includes(key)) {
                const value = (filtro as any)[key];
                if (value !== undefined && value !== null && value !== '') {
                    if (key === 'expand') {
                        // Serializa expand como CSV
                        params[key] = Array.isArray(value) ? value.join(',') : value;
                        return;
                    }
                    // Se for um objeto enum, pega a propriedade 'key'
                    if (typeof value === 'object' && value.key) {
                        params[key] = value.key;
                    } else {
                        params[key] = value;
                    }
                }
            }
        });

        return params;
    }
}
