import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractCrud} from '@/shared/crud/abstract.crud';
import {Evento} from '@/shared/model/evento';
import {EventoFilter} from '@/shared/model/filter/evento-filter';
import {EventoService} from '@/services/evento.service';
import {map, Observable} from 'rxjs';
import {StatusEnum} from '@/shared/model/enum/status.enum';
import {EventoDTO} from "@/shared/model/dto/evento-dto";
import {PageResponse} from "@/shared/model/page-response";
import {EventoMapper} from "@/shared/model/dto/evento-mapper";
import {catchError, filter, tap} from "rxjs/operators";
import {Mode} from "@/shared/crud/crud.mode";
import {Cliente} from "@/shared/model/cliente";

@Injectable()
export class EventoCrudVM extends AbstractCrud<Evento, EventoFilter> {
    constructor(
        port: EventoService,
        route: ActivatedRoute,
        router: Router,
    ) {
        super(port, route, router);
        this.model = this.newModel();
        this.filter = this.newFilter();
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
                const eventos: Evento[] = (page.content as EventoDTO[]) // 1. Garante que é EventoDTO[]
                    .map(EventoMapper.fromDTO)                          // 2. Transforma cada EventoDTO em Evento | undefined
                    .filter((e): e is Evento => !!e);   // 3. Filtra os undefined e garante o tipo Evento[]
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
        this.model = row as Evento;
        this.mode = Mode.Edit;
        this.refreshModel.next();
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

        return (this.port.salvar(eventoDTO as Evento) as Observable<EventoDTO>).pipe(
            map((savedDTO: EventoDTO) => {
                // Mapeia o DTO retornado pela API para o seu modelo local (Evento)
                const eventoModel = EventoMapper.fromDTO(savedDTO);
                if (!eventoModel) {
                    throw new Error('Falha crítica de mapeamento: DTO retornado é inválido.');
                }
                return eventoModel;
            }),
            tap((saved) => {
                this.model = saved;
                this.onSaveSuccess();
            }),
            catchError((err) => this.handleError<Evento>(err, 'Falha ao salvar registro'))
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

    private getClienteId(): number | undefined {
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
