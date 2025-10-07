export const ProdutoTipoEnum = {
    ROUPA_ADULTO: {
        key: 'ROUPA_ADULTO',
        descricao: 'Roupa Adulto'
    },
    ROUPA_CRIANCA: {
        key: 'ROUPA_CRIANCA',
        descricao: 'Roupa Criança'
    },
    SAPATO: {
        key: 'SAPATO',
        descricao: 'Sapato'
    },
    SANDALIA: {
        key: 'SANDALIA',
        descricao: 'Sandalia'
    },
    TENIS: {
        key: 'TENIS',
        descricao: 'Tenis'
    },
    OBJETO: {
        key: 'OBJETO',
        descricao: 'Outros Objetos'
    }
} as const; // O 'as const' é crucial aqui!

// Crie um tipo a partir dos VALORES do objeto
// keyof typeof ProdutoTipoEnum -> Pega as chaves ('ROUPA_ADULTO', 'ROUPA_CRIANCA', etc.)
// typeof ProdutoTipoEnum[keyof typeof ProdutoTipoEnum] -> Pega os tipos dos valores correspondentes a essas chaves
export type ProdutoTipoEnum = typeof ProdutoTipoEnum[keyof typeof ProdutoTipoEnum];


/*  ### Metodos uteis


// ✅ Obter todos os valores (substitui .values())
const todosStatus = Object.values(StatusEnum);
// Resultado: [{key: 'ATIVO', ...}, {key: 'INATIVO', ...}]
console.log(todosStatus);

// ✅ Obter todas as chaves (substitui .keys())
const todasChaves = Object.keys(StatusEnum);
// Resultado: ['ATIVO', 'INATIVO']
console.log(todasChaves);

// ✅ Obter um valor pela chave (substitui .valueOf())
function valueOf(key: keyof typeof StatusEnum): StatusEnum | null {
    return StatusEnum[key] || null;
}
const statusAtivo = valueOf('ATIVO');
console.log(statusAtivo?.descricao); // 'Status Ativo'

// ✅ Usando o tipo para segurança em funções
function processarStatus(status: StatusEnum): void {
    console.log(`Processando: ${status.descricao} (Cor: ${status.cor})`);
}
processarStatus(StatusEnum.ATIVO); // Funciona!
// processarStatus({ key: 'QUALQUER', ... }); // Erro de compilação! 👏


 */
