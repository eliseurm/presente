import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractCrud } from '@/shared/crud/abstract.crud';
import { Produto } from '@/shared/model/produto';
import { ProdutoFilter } from '@/shared/model/filter/produto-filter';
import { ProdutoService } from '@/services/produto.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Mode } from '@/shared/crud/crud.mode';
import { PageResponse } from '@/shared/model/page-response';
import { catchError, tap } from 'rxjs/operators';
import { ProdutoMapper } from '@/shared/model/mapper/produto-mapper';
import { StatusEnum } from '@/shared/model/enum/status.enum';

@Injectable()
export class ProdutoCrudVM extends AbstractCrud<Produto, ProdutoFilter> {
    constructor(port: ProdutoService, route: ActivatedRoute, router: Router) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected get produtoService(): ProdutoService {
        return this.port as ProdutoService;
    }

    protected newModel(): Produto {
        return {
            id: undefined,
            nome: '',
            descricao: '',
            preco: undefined,
            status: StatusEnum.ATIVO,
            imagens: [],
            estoques: [], // Inicializa lista de estoque vazia
            version: undefined
        } as unknown as Produto;
    }

    protected newFilter(): ProdutoFilter {
        return new ProdutoFilter();
    }

    override doFilter(): Observable<PageResponse<Produto>> {
        // aplica expand opcionalmente sem poluir o filtro persistido
        const filtroComExpand = this.attachExpandToFilterIfNeeded();
        return this.port.listar(filtroComExpand).pipe(
            switchMap((page) => {
                // Se não houver produtos, apenas segue o fluxo
                if (!page.content || page.content.length === 0) {
                    return of(page);
                }

                // Criamos um array de observables (um para cada busca de imagem)
                const detalheRequests = page.content.map((produto) =>
                    this.produtoService.getProdutoImagem(produto.id as number).pipe(
                        tap((imagens) => (produto.imagens = imagens)), // Acopla as imagens ao produto
                        catchError(() => of([])) // Se uma imagem falhar, não trava a lista toda
                    )
                );

                // forkJoin executa todas em paralelo e espera o fim de todas
                return forkJoin(detalheRequests).pipe(
                    map(() => page) // Retorna a página original, agora com os produtos populados
                );
            }),
            tap((page) => {
                this.dataSource = page.content;
                this.totalRecords = page.totalElements;
                this.saveToStorage();
            }),
            catchError((err) => this.handleError<PageResponse<Produto>>(err, 'Falha ao carregar lista'))
        );
    }

    override onRowOpen(row: Produto): void {
        const id = row && (row as any).id;
        this.mode = Mode.Edit;
        this.model = row;
        this.refreshModel.next();

        if (id != null) {
            this.port.getById(id, this.getExpandParam()).subscribe({
                next: (dto) => {
                    this.model = ProdutoMapper.fromDto(dto);
                    this.refreshModel.next();
                },
                error: (e) => this.handleError(e, 'Falha ao carregar registro')
            });
        } else {
            // fallback: sem ID, usa o próprio objeto
        }
    }

    override canDoSave(): boolean {
        const ok = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
        this.errorsVisible = !ok;
        this.errorMessages = ok ? [] : ['Informe o nome do produto.'];
        return ok;
    }

    // Normaliza associações (enviar apenas IDs) antes de salvar
/*
    override doSave(): Observable<Produto> {
        const mapToIds = (arr?: any[]) => (arr || []).filter((x) => !!x).map((x: any) => ({ id: typeof x === 'object' ? x.id : x }));
        const payload: any = {
            ...this.model,
            cores: mapToIds((this.model as any).cores),
            tamanhos: mapToIds((this.model as any).tamanhos),
            imagens: mapToIds((this.model as any).imagens)
        };

        const dto = ProdutoMapper.toDto(payload);
        return this.port.salvar(dto).pipe(
            tap((saved) => {
                this.model = saved;
                this.onSaveSuccess();
            }),
            catchError((err) => this.handleError<Produto>(err, 'Falha ao salvar registro'))
        );
    }
*/

    override doSave(): Observable<Produto> {
        // Mapeia apenas IDs para imagens se necessário, ou envia objeto completo dependendo do seu Backend.
        // Assumindo que o backend espera objetos completos para o estoque (Cascade)
        // mas IDs para imagens.

        // const mapToIds = (arr?: any[]) => (arr || []).filter((x) => !!x).map((x: any) => ({ id: typeof x === 'object' ? x.id : x }));
        // const payload: any = {
        //     ...this.model,
        //     imagens: mapToIds((this.model as any).imagens),
        //     // Estoques geralmente são enviados completos para o JPA gerenciar (save/update/delete)
        //     estoques: this.model.estoques
        // };

        // Se usar Mapper, garanta que ele suporte a nova estrutura
        const dto = ProdutoMapper.toDto(this.model);

        return this.port.salvar(dto).pipe(
            // Ou dto
            tap((saved) => {
                this.model = saved;
                this.onSaveSuccess();
            }),
            catchError((err) => this.handleError<Produto>(err, 'Falha ao salvar registro'))
        );
    }

}
