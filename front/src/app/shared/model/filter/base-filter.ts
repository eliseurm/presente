// src/app/shared/model/filter/base-filter.ts
export interface BaseFilter {
    page?: number;
    size?: number;
    sort?: string;
    direction?: string;
}
