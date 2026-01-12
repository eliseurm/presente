// src/app/shared/model/filter/base-filter.ts
export type SortDirection = 'ASC' | 'DESC';
export interface SortSpec { field: string; direction?: SortDirection }

export abstract class BaseFilter {
    page: number = 0;
    size: number = 10;
    order?: string[] = ['id,ASC'];

    totalItens?: number = 0;
    // Suporte genérico a expansão de relacionamentos (ex.: expand=pessoas,cliente)
    // Por padrão fica desabilitado (undefined). Quando usado, pode ser string ("pessoas,cliente")
    // ou string[] (["pessoas","cliente"]).
    expand?: string | string[];

    constructor(init?: Partial<BaseFilter>) {
        Object.assign(this, init);
    }
}
