// src/app/shared/model/filter/base-filter.ts
export abstract class BaseFilter {
    page: number = 1;
    size: number = 10;
    sort: string = 'id';
    direction: string = 'ASC';

    constructor(init?: Partial<BaseFilter>) {
        Object.assign(this, init);
    }
}
