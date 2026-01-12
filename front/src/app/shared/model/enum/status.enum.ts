const _StatusEnum = {
    ATIVO: { key: 'ATIVO', descricao: 'Ativo' },
    PAUSADO: { key: 'PAUSADO', descricao: 'Pausado' },
    ENCERRADO: { key: 'ENCERRADO', descricao: 'Encerrado' }
} as const;

// 3. Export the Type
// This extracts the UNION of the VALUES (the objects themselves)
// If you want the type to be the KEYS ('ATIVO' | 'PAUSADO'), use: typeof _StatusEnum[keyof typeof _StatusEnum]['key']
// But based on your code (u.status === StatusEnum.ATIVO), you seem to compare Objects.
// However, usually Enums in databases are Strings.
// Let's assume the "Value" of the enum in the DB is the KEY string.

export type StatusEnum = (typeof _StatusEnum)[keyof typeof _StatusEnum];

// 4. Merge Namespace and Constant Export
// We re-export the constant properties inside the namespace or just export the object as the main symbol.
// The cleanest way to achieve "StatusEnum.ATIVO" (object) AND "StatusEnum.toKey()" (function) is:

export const StatusEnum = {
    ..._StatusEnum,

    // Utility function attached directly to the object
    toKey: (value: any): any => {
        if (!value) return StatusEnum.ATIVO.key;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return (value.key || value.name || value.toString());
        return String(value);
    }
};

