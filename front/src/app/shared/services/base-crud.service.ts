// src/app/shared/services/base-crud.service.ts
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../model/page-response';
import { BaseFilter } from '../model/filter/base-filter';

export abstract class BaseCrudService<T, F extends BaseFilter> {
    protected abstract apiUrl: string;

    constructor(protected http: HttpClient) {}

    listar(filtro: F): Observable<PageResponse<T>> {
        const params = this.buildParams(filtro);
        return this.http.get<PageResponse<T>>(this.apiUrl, { params });
    }

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

    protected buildParams(filtro: F): any {
        const params: any = {};

        // Adiciona parâmetros de paginação e ordenação
        if (filtro.page !== undefined) params['page'] = filtro.page.toString();
        if (filtro.size !== undefined) params['size'] = filtro.size.toString();
        if (filtro.sort) params['sort'] = filtro.sort;
        if (filtro.direction) params['direction'] = filtro.direction;

        // Adiciona outros filtros (implementação específica em cada service)
        Object.keys(filtro).forEach(key => {
            if (!['page', 'size', 'sort', 'direction'].includes(key)) {
                const value = (filtro as any)[key];
                if (value !== undefined && value !== null && value !== '') {
                    params[key] = value;
                }
            }
        });

        return params;
    }
}
