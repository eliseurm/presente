export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date' | 'enum';
    placeholder?: string;
    options?: { label: string; value: any }[];
    enumObject?: object;  // Adicionar suporte a enum
    optionLabel?: string; // Para indicar qual propriedade usar como label no enum
}
