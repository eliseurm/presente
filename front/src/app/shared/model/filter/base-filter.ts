// src/app/shared/model/filter/base-filter.ts
export class BaseFilter {
    page?: number;
    size?: number;
    sort?: string;
    direction?: string;

    constructor(init?: Partial<BaseFilter>) {
        Object.assign(this, init);
    }
}
