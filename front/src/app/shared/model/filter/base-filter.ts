// src/app/shared/model/filter/base-filter.ts
export type SortDirection = 'ASC' | 'DESC';
export interface SortSpec { field: string; direction?: SortDirection }

export abstract class BaseFilter {
    page: number = 1;
    size: number = 500;
    // Nova estratégia de ordenação: múltiplas colunas
    // Cada item pode informar direction; se omitido, backend decidirá o default
    sorts?: SortSpec[];
    // Suporte genérico a expansão de relacionamentos (ex.: expand=pessoas,cliente)
    // Por padrão fica desabilitado (undefined). Quando usado, pode ser string ("pessoas,cliente")
    // ou string[] (["pessoas","cliente"]).
    expand?: string | string[];

    constructor(init?: Partial<BaseFilter>) {
        Object.assign(this, init);
    }
}
