import {FilterField} from "@/shared/components/crud-filter/filter-field";

function keyToLabel(key: string): string {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
}

type FieldOverrides = {
    [key: string]: Partial<FilterField>;
};

// A função de geração automática
export function generateFields(filterInstance: Record<string, any>, overrides: FieldOverrides = {}): FilterField[] {

    const keys = Object.keys(filterInstance);

    return keys.map(key => {
        // Agora o TypeScript sabe que filterInstance[key] é um acesso válido.
        const value = filterInstance[key];
        let type: FilterField['type'] = 'text';
        if (typeof value === 'number') type = 'number';
        if (value instanceof Date) type = 'date';
        const label = keyToLabel(key);

        const inferredSpec: FilterField = {
            key: key,
            label: label,
            type: type,
            placeholder: `Digite o/a ${label.toLowerCase()}`
        };

        return { ...inferredSpec, ...overrides[key] };
    });
}
