import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BaseFilter, SortSpec} from '@/shared/model/core/base-filter';
import { PageResponse } from '@/shared/model/page-response';
import { CrudPort } from '@/shared/services/crud-port';
import {tap} from "rxjs/operators";

// Classe base de serviços CRUD no front-end que implementa o contrato CrudPort
// export abstract class BaseCrudService<T extends { id?: any; version?: number }, F extends BaseFilter> implements CrudPort<T, F> {
export abstract class BaseCrudService<T extends { id?: any; version?: number }, F extends BaseFilter, D = T> implements CrudPort<D, F> {
    protected abstract apiUrl: string;

    constructor(protected http: HttpClient) {}

    listar(filtro: F): Observable<PageResponse<D>> {
        const params = this.buildParams(filtro);
        return this.http.get<PageResponse<D>>(this.apiUrl, { params });
    }

    buscarPorId(id: number): Observable<D> {
        return this.http.get<D>(`${this.apiUrl}/${id}`);
    }

    criar(entidade: D): Observable<D> {
        return this.http.post<D>(this.apiUrl, entidade);
    }

    atualizar(id: number, entidade: D): Observable<D> {
        return this.http.put<D>(`${this.apiUrl}/${id}`, entidade);
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

    getById(id: any, expand?: string | string[]): Observable<D> {
        const params: any = {};
        if (expand && (Array.isArray(expand) ? expand.length > 0 : String(expand).trim().length > 0)) {
            params['expand'] = Array.isArray(expand) ? expand.join(',') : expand;
        }
        return this.http.get<D>(`${this.apiUrl}/${id}`, { params });
    }

    // getById(id: any, expand?: string | string[]): Observable<T> {
    //     const params: any = {};
    //     if (expand && (Array.isArray(expand) ? expand.length > 0 : String(expand).trim().length > 0)) {
    //         params['expand'] = Array.isArray(expand) ? expand.join(',') : expand;
    //     }
    //     return this.http.get<T>(`${this.apiUrl}/${id}`, { params });
    // }

    salvar(model: D): Observable<D> {
        const hasId = (model as any)?.id != null;
        return hasId ? this.atualizar((model as any).id, model) : this.criar(model);
    }

    // salvar(model: T): Observable<T> {
    //     const hasId = model?.id != null;
    //     return hasId ? this.atualizar(model.id, model) : this.criar(model);
    // }

    excluir(id: any): Observable<void> {
        return this.deletar(id);
    }

    /**
     * Converte o objeto de filtro em HttpParams do Angular
     */
    protected buildParams(filtro: F): HttpParams {
        const payload = this.generateCleanPayload(filtro);
        let params = new HttpParams();

        Object.keys(payload).forEach(key => {
            const value = payload[key];
            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => params = params.append(key, v.toString()));
                } else {
                    params = params.set(key, value.toString());
                }
            }
        });

        return params;
    }

    /**
     * Processa o filtro e retorna um objeto "limpo" com as regras de negócio
     * (Paginação 0-based, formatação de ordens, etc)
     */
    protected generateCleanPayload(filtro: F): any {
        const anyFiltro: any = filtro || {};
        const payload: any = {};

        // 1) Paginação (API Spring é 0-based)
        const p = Number(anyFiltro.page);
        payload.page = p;

        const s = Number(anyFiltro.size);
        payload.size = isNaN(s) ? 10 : s;

        // 2) Ordenação (Converte ['nome,asc'] para ['nome;asc'] conforme seu padrão)
        if (Array.isArray(anyFiltro.order)) {
            payload.order = anyFiltro.order
                .map((s: string) => {
                    const [campo, direcao] = s.split(",");
                    return campo ? `${campo};${(direcao || "asc").toLowerCase()}` : null;
                })
                .filter((x: any) => x !== null);
        }

        // 3) Expand (Array para CSV)
        if (anyFiltro.expand) {
            payload.expand = Array.isArray(anyFiltro.expand)
                ? anyFiltro.expand.join(",")
                : anyFiltro.expand;
        }

        // 4) Mesclar campos restantes do filtro (evitando sobrescrever o que já tratamos)
        Object.keys(anyFiltro).forEach(key => {
            const valorOriginal = anyFiltro[key];

            // Só adiciona se não for um campo de controle já processado e se tiver valor
            const camposControle = ['page', 'size', 'order', 'expand'];
            if (!camposControle.includes(key) && valorOriginal !== '' && valorOriginal !== null && valorOriginal !== undefined) {
                payload[key] = valorOriginal;
            }
        });

        return payload;
    }

}
