// src/app/shared/model/filter/base-filter.ts
export abstract class BaseFilter {
    page: number = 1;
    size: number = 500;
    sort: string = 'id';
    direction: string = 'ASC';
    // Suporte genérico a expansão de relacionamentos (ex.: expand=pessoas,cliente)
    // Por padrão fica desabilitado (undefined). Quando usado, pode ser string ("pessoas,cliente")
    // ou string[] (["pessoas","cliente"]).
    expand?: string | string[];

    constructor(init?: Partial<BaseFilter>) {
        Object.assign(this, init);
    }
}
