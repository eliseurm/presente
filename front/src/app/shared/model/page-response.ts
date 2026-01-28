
export interface PageMetadata {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

export interface PageResponse<T> {
    content: T[];
    page: PageMetadata;
}
