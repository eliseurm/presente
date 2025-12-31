export class ProdutoEstoque {
    id: number;
    produto: ProdutoResumo; // Ou apenas 'produtoId: number' dependendo do seu DTO
    tamanho: Tamanho;
    cor: Cor;
    preco: number;
    quantidade: number;
    status: StatusEnum;
    criadoEm: string; // ISO Date string (ex: '2025-12-31T15:00:00')
    alteradoEm: string; // ISO Date string
    version: number;

    constructor(init?: Partial<ProdutoEstoque>) {
        // Inicialização segura
        this.id = init?.id ?? 0;
        this.produto = init?.produto as ProdutoResumo;
        this.tamanho = init?.tamanho as Tamanho;
        this.cor = init?.cor as Cor;
        this.preco = init?.preco ?? 0;
        this.quantidade = init?.quantidade ?? 0;
        this.status = init?.status || 'ATIVO'; // Valor padrão se necessário
        this.criadoEm = init?.criadoEm ?? '';
        this.alteradoEm = init?.alteradoEm ?? '';
        this.version = init?.version ?? 0;
    }
}
