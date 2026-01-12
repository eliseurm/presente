
export abstract class BaseReportFilter {
    page: number = 0;
    size: number = 10;
    order?: string[] = ['id,ASC'];

    totalItens?: number = 0;

    expand?: string | string[];

    nomeRelatorio?: string;

    nomeArquivo?: string;

    constructor(init?: Partial<BaseReportFilter>) {
        Object.assign(this, init);
    }
}
