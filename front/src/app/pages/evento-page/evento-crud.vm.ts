import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {EventoService} from '@/services/evento.service';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {StatusEnum} from '@/shared/model/enum/status.enum';
import {EventoDto} from "@/shared/model/dto/evento-dto";
import {PageResponse} from "@/shared/model/page-response";
import {EventoMapper} from "@/shared/model/mapper/evento-mapper";
import {catchError, tap} from "rxjs/operators";
import {Mode} from "@/shared/crud/crud.mode";

@Injectable()
export class EventoCrudVM extends AbstractCrud<Evento, EventoFilter> {

    constructor(
        port: EventoService,
        route: ActivatedRoute,
        router: Router
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
    }

    protected get eventoService(): EventoService {
        return this.port as EventoService;
    }

    protected newModel(): Evento {
        return new Evento();
    }

    protected newFilter(): EventoFilter {
        return new EventoFilter();
    }

    // Este metodo foi sobreposto porque o back retorna um EventoDTO e aqui eu reverto para Evento
    override doFilter(): Observable<PageResponse<Evento>> {
        // aplica expand opcionalmente sem poluir o filtro persistido
        const filtroComExpand = this.attachExpandToFilterIfNeeded();
        return this.port.listar(filtroComExpand).pipe(
            map((page) => {
                const  eventos = EventoMapper.fromDtoList(page.content as EventoDto[]);
                return {
                    ...page,
                    content: eventos
                } as PageResponse<any>; // Cast para lidar com o tipo genérico T
            }),
            tap((page) => {
                this.dataSource = page.content;
                this.totalRecords = page.totalElements;
                this.saveToStorage();
            }),
            catchError((err) => this.handleError<PageResponse<Evento>>(err, 'Falha ao carregar lista'))
        );
    }

    override onRowOpen(row: Evento): void {
        // aqui vou fazer diferente do abstract que vai no back, vou tentar aproveitar a informacao que ja esta aqui no row
        this.mode = Mode.Edit;
        this.model = row as Evento;

        // Busca as listas eventoPessoas e eventoProdutos
        if (this.model?.id != null) {
            this.preencherDetalhes(this.model).subscribe({
                next: (modelAtualizado) => {
                    this.model = modelAtualizado;
                    this.refreshModel.next();
                },
                error: (err) => this.messageToastShow(err)
            });
        }
        else {
            this.refreshModel.next();
        }
    }

    override canDoSave(): boolean {
        const errors: string[] = [];

        const nomeOk = !!(this.model?.nome && String(this.model.nome).trim().length > 0);
        if (!nomeOk) errors.push('Informe o nome do evento.');

        const statusOk = !!this.model?.status;
        if (!statusOk) errors.push('Informe o status do evento.');

        const clienteId = this.getClienteId();
        const clienteOk = !!clienteId;
        if (!clienteOk) errors.push('Selecione o cliente.');

        // Datas passam a ser opcionais: não validar como obrigatórias

        this.errorMessages = errors;
        this.errorsVisible = errors.length > 0;
        return errors.length === 0;
    }

    // Normaliza payload antes de salvar (status enum e cliente id)
    override doSave(): Observable<Evento> {
        const eventoDTO = EventoMapper.toDTO(this.model);

        return (this.port.salvar(eventoDTO as Evento) as Observable<EventoDto>).pipe(
            // 1. Converte o DTO recebido para o Modelo
            map((savedDTO: EventoDto) => {
                const eventoModel = EventoMapper.fromDto(savedDTO);
                if (!eventoModel) {
                    throw new Error('Falha crítica de mapeamento: DTO retornado é inválido.');
                }
                return eventoModel;
            }),
            tap((modelCompleto) => {
                // Aqui nem precisa setar o model, porque vai voltar para a tela de list
                // this.model = modelCompleto;
                this.onSaveSuccess();
            }),
            // 4. Tratamento de erro centralizado para ambas as chamadas
            catchError((err) => this.handleError<Evento>(err, 'Falha ao salvar registro'))
        );
    }

    preencherDetalhes(evento: Evento): Observable<Evento> {
        if (!evento?.id) return of(evento);

        // Se as listas já estiverem preenchidas, não busca novamente
        if (evento.eventoPessoas && evento.eventoPessoas?.length > 0 && evento.eventoProdutos && evento.eventoProdutos?.length > 0) {
            return of(evento);
        }

        return forkJoin({
            pessoas: this.eventoService.getEventoPessoa(evento.id),
            produtos: this.eventoService.getEventoProduto(evento.id)
        }).pipe(
            map(result => {
                evento.eventoPessoas = result.pessoas;
                evento.eventoProdutos = result.produtos;
                return evento;
            })
        );
    }

    private toStatusKey(value: any): string | undefined {
        if (!value) return undefined;
        if (typeof value === 'string') {
            const encontrado = (Object.values(StatusEnum) as any[])
                    .find(v => v.key === value) ||
                (Object.values(StatusEnum) as any[]).find(v => (v.descricao || '').toLowerCase() === value.toLowerCase());
            return encontrado?.key;
        }
        if (typeof value === 'object') {
            return value.key ?? undefined;
        }
        return undefined;
    }

    getClienteId(): number | undefined {
        const c: any = this.model?.cliente;
        if (!c) return undefined;
        if (typeof c === 'object') return c.id ?? undefined;
        if (typeof c === 'number') return c;
        return undefined;
    }

    // Converte Date para string local no padrão 'YYYY-MM-DDTHH:mm' (sem fuso/segundos)
    private toLocalMinuteString(d: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hour = pad(d.getHours());
        const minute = pad(d.getMinutes());
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
}
