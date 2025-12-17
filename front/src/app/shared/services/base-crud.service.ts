import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BaseFilter, SortSpec} from '@/shared/model/filter/base-filter';
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

    protected buildParams(filtro: F): HttpParams {
        const anyFiltro: any = filtro || {};

        // cria payload limpo
        const payload: any = {};

        // ----------------------------
        // 1) PAGE (converter 1-based → 0-based)
        // ----------------------------
        if (anyFiltro.page != null) {
            const p = Number(anyFiltro.page);
            payload.page = isNaN(p) ? 0 : Math.max(0, p - 1);
        } else {
            payload.page = 0;
        }

        // ----------------------------
        // 2) SIZE
        // ----------------------------
        if (anyFiltro.size != null) {
            const s = Number(anyFiltro.size);
            payload.size = isNaN(s) ? 10 : s;
        } else {
            payload.size = 10;
        }

        // ----------------------------
        // 3) ORDER — já vem como array de strings
        //    ['id,desc', 'nome,asc']
        //    Apenas normalizamos para lowercase em direção (opcional)
        // ----------------------------
        if (Array.isArray(anyFiltro.order) && anyFiltro.order.length > 0) {
            payload.order = (anyFiltro.order as string[])
                .filter((s: string) => typeof s === "string" && s.trim() !== "")
                .map((s: string) => {
                    const [campo, direcao] = s.split(",");
                    if (!campo) return null;
                    const d = (direcao || "asc").toLowerCase();
                    return `${campo};${d}`;
                })
                .filter((x: string | null) => x != null) as string[];
        }

        // ----------------------------
        // 4) EXPAND — array → CSV
        // ----------------------------
        if (anyFiltro.expand) {
            if (Array.isArray(anyFiltro.expand)) {
                payload.expand = anyFiltro.expand.join(",");
            } else {
                payload.expand = anyFiltro.expand;
            }
        }

        // ----------------------------
        // 5) Remover valores vazios/undefined
        // ----------------------------
        Object.keys(anyFiltro).forEach(key => {
            const v = anyFiltro[key];
            const vp = payload[key];
            if (v && !vp) {
                payload[key] = v;
            }
        });

        return payload;
    }


}
