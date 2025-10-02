export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    placeholder?: string;
    options?: { label: string; value: any }[];
}
